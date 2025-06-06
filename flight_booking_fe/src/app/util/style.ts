import { SlateText } from "../models/chatbot.model";

// Function to render styled text
export const renderStyledText = (children: SlateText[]): string => {
  return children
    .map((child) => {
      let style = '';
      if (child.fontWeight === '700') {
        style += 'font-bold ';
      }
      if (child.color) {
        style += `color: rgb(${child.color.r},${child.color.g},${child.color.b}) `;
      }
      if (child.underline) {
        style += 'text-decoration-line: underline ';
      }
      return `<span class="${style.trim()}">${child.text}</span>`;
    })
    .join('');
};
