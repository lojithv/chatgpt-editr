import React, { useEffect, useState } from "react";
import "./App.css";

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
  const [documentName, setDocumentName] = useState("");

  useEffect(() => {
    testDom();
  }, []);

  const testDom = () => {
    function modifyDOM() {
      //You can play with your DOM here or check URL against your regex
      const documentCopy = document;
      return documentCopy.body.innerHTML;
    }

    //We have permission to access the activeTab, so we can call chrome.tabs.executeScript:
    chrome.tabs.executeScript(
      {
        code: "(" + modifyDOM + ")();", //argument here is a string but function.toString() returns function's code
      },
      (results) => {
        //Here we have just the innerHTML and not DOM structure
        var div = document.createElement("div");
        const buttonElem ='<button class="flex ml-auto gap-2"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>Copy code</button>'

        div.innerHTML = results[0].trim().replace(buttonElem,'');;

        const chatTitleElem = div.getElementsByClassName(
          "flex py-3 px-3 items-center gap-3 relative rounded-md cursor-pointer break-all )} pr-14 )} bg-gray-800 hover:bg-gray-800 group"
        );
        const chatTitle = chatTitleElem[0]?.textContent;
        if (chatTitle) {
          console.log(chatTitle);
          setDocumentName(chatTitle);
        }

        const all = div.getElementsByClassName("flex flex-grow flex-col gap-3");

        const divsHtml = [];

        for (let i = 0; i < all.length; i++) {
          divsHtml.push(
            '<div style="color:black;">' + all[i].outerHTML + "</div>"
          );
          divsHtml.push('<div style="height:30px;"></div>');
        }
        const html = divsHtml.join("");
        setDom(html);
      }
    );
  };

  const handleMessage = (message: { dom: React.SetStateAction<string> }) => {
    if (message.dom) {
      setDom(message.dom);
    }
  };

  chrome.runtime.onMessage.addListener(handleMessage);

  const handleDownload = (downloadOption?: DownloadType) => {
    if (downloadType.downloadNow || dom) {
      if (downloadOption === DownloadType.DOC) {
        Export2Word(documentName);
        return;
      }

      var wnd = window.open("about:blank", "", "_blank");
      if (wnd && wnd.document) {
        var preHtml = `<html><head><meta charset='utf-8'><title>${
          documentName ? documentName : "Export HTML To Doc"
        }</title></head><body>`;
        var postHtml = "</body></html>";

        var html = preHtml + dom + postHtml;

        wnd?.document.write(html);
        wnd?.print();
      }
    } else {
      setDownloadType({ ...downloadType, downloadNow: true });
    }
  };

  function Export2Word(filename = "") {
    var preHtml =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'><head><meta charset='utf-8'><title>Export HTML To Doc</title></head><body style='color:black;'>";
    var postHtml = "</body></html>";

    var html = preHtml + dom + postHtml;

    // Specify link url
    var url =
      "data:application/vnd.ms-word;charset=utf-8," + encodeURIComponent(html);

    // Specify file name
    filename = filename ? filename + ".doc" : "document.doc";

    // Create download link element
    var downloadLink = document.createElement("a");

    document.body.appendChild(downloadLink);

    // Create a link to the file
    downloadLink.href = url;

    // Setting the file name
    downloadLink.download = filename;

    //triggering the function
    downloadLink.click();

    document.body.removeChild(downloadLink);
  }

  const getElement = () => {
    return <div dangerouslySetInnerHTML={{ __html: dom }} />;
  };

  return (
    <div className="App">
      {true && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            width: "100%",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              alignItems: "center",
              width: "100%",
              height: "60px",
              gap: "40px",
              position: "fixed",
              top: "0px",
              left: "0px",
              backgroundColor: "#d6ffe1",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
              }}
            >
              <img src="./logo.svg" width={40} height={40} />
              <div className="logo-text" style={{ fontSize: "15px" }}>
                ChatGPT2Doc
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
              }}
            >
              <button
                className="export-btn"
                onClick={() => handleDownload()}
                title="DOWNLOAD AS A PDF"
              >
                <img src="./pdf.svg" width={35} height={35} />
              </button>
              <button
                onClick={() => handleDownload(DownloadType.DOC)}
                className="export-btn"
                title="DOWNLOAD AS A DOC"
              >
                <img src="./doc.svg" width={35} height={35} />
              </button>
            </div>
          </div>
          <div className="solid"></div>

          <div className="chat-preview" id="contentToPrint">
            {getElement()}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
