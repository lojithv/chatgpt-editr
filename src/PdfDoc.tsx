import React from "react";
import { Document, Page, Text } from "@react-pdf/renderer";
import { EditorState } from "draft-js";

function PdfDoc({ editorState }: { editorState: EditorState }) {
  const content = editorState.getCurrentContent().getPlainText();

  return (
    <Document>
      <Page>
        <Text>{content}</Text>
      </Page>
    </Document>
  );
}

export default PdfDoc