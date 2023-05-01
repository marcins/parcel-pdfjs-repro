import * as PDFJSViewer from 'pdfjs-dist/web/pdf_viewer';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/'; // TODO: use web workers instead of fake worker.

const fetchPdf = (url) => {
  return pdfjsLib.getDocument({url, verbosity: pdfjsLib.VerbosityLevel.INFOS}).promise;
};

async function main() {
    const eventBus = new PDFJSViewer.EventBus();
    const doc = await fetchPdf("/dummy.pdf");
    const $el = document.getElementById('container');
    const $viewer = document.getElementById('viewer');
    const pdfViewer = new PDFJSViewer.PDFViewer({ 
        container: $el,
        viewer: $viewer,
        eventBus: eventBus,
    });
    pdfViewer.setDocument(doc);
}

main().catch(err => {
    console.error(err);
})
