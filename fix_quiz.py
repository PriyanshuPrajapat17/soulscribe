import re
with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(r'Close the quiz[^\x27]*', 'Close the quiz', text)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(text)
print('Fixed close the quiz')
