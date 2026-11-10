import pdfplumber, json, re, sys
pdf = pdfplumber.open(sys.argv[1])
out = []
for page in pdf.pages:
    words = page.extract_words(extra_attrs=['fontname','size'], keep_blank_chars=False)
    for w in words:
        out.append((w['text'], w['fontname'], round(w['size'],1)))
json.dump(out, open(sys.argv[2],'w'))
print(len(out))
