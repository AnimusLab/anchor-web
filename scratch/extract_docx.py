import docx
import os

def convert_docx_to_md(docx_path, md_path):
    doc = docx.Document(docx_path)
    content = []
    for para in doc.paragraphs:
        content.append(para.text)
    
    with open(md_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(content))

if __name__ == "__main__":
    input_file = "Anchor V6 Preprint Draft.docx"
    output_file = "scratch/anchor_preprint_draft.md"
    
    if os.path.exists(input_file):
        convert_docx_to_md(input_file, output_file)
        print(f"Successfully converted {input_file} to {output_file}")
    else:
        print(f"File not found: {input_file}")
