import React, { useState } from "react";
import logo from "./logo.svg";
import "./App.css";

function App() {
  const [dom, setDom] = useState("");

  const testDom = () => {
    // console.log("Test dom")
    // chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    //   const activeTab = tabs[0];
    //   if (activeTab && activeTab.id) {
    //     console.log(activeTab)
    //     chrome.tabs.sendMessage(activeTab.id, { message: "get_dom" });
    //   }
    // });

    console.log("Popup DOM fully loaded and parsed");

    function modifyDOM() {
      //You can play with your DOM here or check URL against your regex
      console.log("Tab script:");
      console.log(document.body);
      return document.body.innerHTML;
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
        const collection = div.getElementsByClassName("markdown");

        const divsHtml = [];

        for (let i = 0; i < collection.length; i++) {
          divsHtml.push(collection[i].outerHTML);
        }
        const html = divsHtml.join('');
        setDom(html);
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

  return (
    <div className="App">
      <header className="App-header">
        {dom ? (
          <div
            className="content"
            dangerouslySetInnerHTML={{ __html: dom }}
          ></div>
        ) : (
          <>
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Edit <code>src/App.tsx</code> and save to reload.
            </p>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
          </>
        )}

        <button onClick={testDom}>Read Dom</button>
      </header>
    </div>
  );
}

export default App;
