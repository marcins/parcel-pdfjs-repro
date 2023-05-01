const { Transformer } = require("@parcel/plugin");
const { parse } = require("@swc/core");
const { Visitor } = require("@swc/core/Visitor");

class FixVisitor extends Visitor {
  constructor() {
    super();
    this.found = false;
    this.start = null;
    this.end = null;
  }

  visitAssignmentExpression(n) {
    const { left, right } = n;

    if (
      left.type === "Identifier" &&
      left.value === "fakeWorkerFilesLoader" &&
      right.type === "ConditionalExpression"
    ) {
      this.found = true;
      this.start = right.span.start;
      this.end = right.span.end;
    }
    return super.visitAssignmentExpression(n);
  }
}

const REPLACEMENT_CODE = `async function() { 
    const m = require('./pdf.worker.js');
    return m.WorkerMessageHandler;
};`;

module.exports = new Transformer({
  async transform({ asset, logger }) {
    let code = await asset.getCode();
    if (!code.includes("fakeWorkerFilesLoader")) {
      return [asset];
    }
    logger.info({
      message: `Found fakeWorkerFilesLoader in ${asset.filePath}`,
    });
    const ast = await parse(code, {
      syntax: "typescript",
      tsx: true,
    });
    const visitor = new FixVisitor();
    visitor.visitProgram(ast);
    if (visitor.found) {
      code =
        code.substring(0, visitor.start - 2) +
        REPLACEMENT_CODE +
        code.substring(visitor.end);
      asset.setCode(code);
    }
    return [asset];
  },
});
