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

  useEffect(() => {
    testDom();
  }, []);

  const testDom = () => {
    function modifyDOM() {
      //You can play with your DOM here or check URL against your regex
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
        var div = document.createElement("div");
        div.innerHTML = results[0].trim();

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
        Export2Word("document-html.pdf");
        return;
      }

      var wnd = window.open("about:blank", "", "_blank");
      wnd?.document.write(dom);
      wnd?.print();
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
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              gap: "40px",
            }}
          >
            <div style={{ fontSize: "15px" }}>Export Options</div>
            <button onClick={() => handleDownload()} title="DOWNLOAD AS A PDF">
              <img src="./pdf.svg" />
            </button>
            <button
              onClick={() => handleDownload(DownloadType.DOC)}
              title="DOWNLOAD AS A DOC"
            >
              <img src="./doc.svg" />
            </button>
          </div>
          <div className="solid"></div>

          <div id="contentToPrint">{getElement()}</div>
        </div>
      )}
    </div>
  );
}

export default App;
