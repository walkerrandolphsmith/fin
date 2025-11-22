const fs = require("fs-extra");
const path = require("path");
const { execSync } = require("child_process");
const { mkdirSync, existsSync, cpSync } = require("fs");

const docsDir = path.join(__dirname, "..", "..", "docs");
const distDir = path.join(__dirname, "dist");
const inputFile = path.join(docsDir, "README.md");
const outputFile = path.join(distDir, "README.md");

async function main() {
  let md = await fs.readFile(inputFile, "utf-8");

  if (!existsSync(distDir)) {
    mkdirSync(distDir);
  }

  cpSync(path.join(docsDir, "wireframes"), path.join(distDir, "wireframes"), {
    recursive: true,
  });

  let diagramIndex = 0;
  const mermaidRegex = /```mermaid\s*([\s\S]*?)```/g;

  md = md.replace(mermaidRegex, (match, code) => {
    const mmdFile = path.join(distDir, `diagram_${diagramIndex}.mmd`);
    const pngFile = path.join(distDir, `diagram_${diagramIndex}.png`);
    fs.writeFileSync(mmdFile, code, "utf-8");
    execSync(`mmdc -i ${mmdFile} -o ${pngFile}`);
    fs.unlinkSync(mmdFile);
    diagramIndex++;
    return `![Diagram ${diagramIndex}](${pngFile})`;
  });
  await fs.writeFile(outputFile, md, "utf-8");
  console.log("All Mermaid diagrams converted and embedded successfully!");
}

main().catch(console.error);
