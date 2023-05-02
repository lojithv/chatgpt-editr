import React, { useRef, useState } from "react";
import logo from "./logo.svg";
import "./App.css";
import {
  ContentState,
  Editor,
  EditorState,
  convertFromHTML,
  convertToRaw,
} from "draft-js";
import { PDFDownloadLink } from "@react-pdf/renderer";
import PdfDoc from "./PdfDoc";
import jsPDF from "jspdf";

import SunEditor from "suneditor-react";
import "suneditor/dist/css/suneditor.min.css";
import draftToHtml from "draftjs-to-html";

enum DownloadType {
  PDF = "PDF",
  DOC = "DOC",
}

function App() {
  const [dom, setDom] = useState("");
  const [downloadType, setDownloadType] = useState({
    type: DownloadType.PDF,
    downloadNow: false,
  });
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const suneditor = useRef();

  const getSunEditorInstance = (sunEditor: any) => {
    suneditor.current = sunEditor;
    console.log(sunEditor)
  };

  const testDom = () => {
    function modifyDOM() {
      //You can play with your DOM here or check URL against your regex
      console.log("Tab script:");
      console.log(document.body);
      const documentCopy = document;
      const elems = documentCopy.querySelectorAll("span button");
      elems.forEach((e) => e.remove());
      return documentCopy.body.innerHTML;
    }

    //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
    chrome.tabs.executeScript(
      {
        code: "(" + modifyDOM + ")();", //argument here is a string but function.toString() returns function's code
      },
      (results) => {
        //Here we have just the innerHTML and not DOM structure
        console.log("Popup script:");
        console.log(results[0]);
        var div = document.createElement("div");
        div.innerHTML = results[0].trim();

        const all = div.getElementsByClassName("flex flex-grow flex-col gap-3");

        console.log(all);

        const divsHtml = [];

        for (let i = 0; i < all.length; i++) {
          divsHtml.push(all[i].outerHTML);
          divsHtml.push(
            '<div style="background-color:red; height:30px;"></div>'
          );
        }
        const html = divsHtml.join("");
        setDom(html);
        const blocksFromHTML = convertFromHTML(html);
        console.log(blocksFromHTML);
        const state = ContentState.createFromBlockArray(
          blocksFromHTML.contentBlocks,
          blocksFromHTML.entityMap
        );
        setEditorState(EditorState.createWithContent(state));
      }
    );
  };

  const handleMessage = (message: { dom: React.SetStateAction<string> }) => {
    console.log("handle message");
    if (message.dom) {
      setDom(message.dom);
      console.log(message.dom);
    }
  };

  chrome.runtime.onMessage.addListener(handleMessage);

  const handleDownload = () => {
    if (downloadType.downloadNow) {
      var doc = new jsPDF();

      // Source HTMLElement or a string containing HTML.
      var elementHTML = document.querySelector(
        "#contentToPrint"
      ) as HTMLElement;

      var finalHtml = document.createElement("div");
      finalHtml.innerHTML = dom;

      if (finalHtml) {
        doc.html(finalHtml, {
          callback: function (doc) {
            // Save the PDF
            doc.save("document-html.pdf");
          },
          margin: [10, 10, 10, 10],
          autoPaging: "text",
          x: 0,
          y: 0,
          width: 190, //target width in the PDF document
          windowWidth: 675, //window width in CSS pixels
        });
      }
    } else {
      console.log("get download link");
      setDownloadType({ ...downloadType, downloadNow: true });
    }
  };

  const handleSunEditorChange = (content: string) =>{
    console.log(content)
    setDom(content)
  }

  return (
    <div className="App">
      <header className="App-header">
        {dom ? (
          <>
            <div id="contentToPrint">
              {/* <Editor
                editorState={editorState}
                onChange={setEditorState}
                readOnly={downloadType.downloadNow}
                textAlignment="left"
              /> */}
              <SunEditor
                setDefaultStyle="text-align:left;"
                setContents={dom}
                onChange={handleSunEditorChange}
              />
            </div>
            {downloadType.downloadNow ? (
              <button onClick={handleDownload}>DOWNLOAD AS A PDF</button>
            ) : (
              <button onClick={handleDownload}>CONVERT TO HTML</button>
            )}
          </>
        ) : downloadType.downloadNow ? (
          <PDFDownloadLink
            document={<PdfDoc editorState={editorState} />}
            fileName="my-document.pdf"
          >
            {({ blob, url, loading, error }) =>
              loading ? "Loading document..." : "Download PDF"
            }
          </PDFDownloadLink>
        ) : (
          <>
            <button onClick={testDom}>Read Dom</button>
          </>
        )}
      </header>
    </div>
  );
}

export default App;
function customEntityTransform(...args: any[]) {
  throw new Error("Function not implemented.");
}
