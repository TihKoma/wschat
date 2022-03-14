import re
import codecs
import sys

fileName = sys.argv[1]
url = sys.argv[2]
pipe_url = sys.argv[3]

#print(fileName)
#print(url)

with codecs.open(fileName, 'r', 'utf-8') as file:
    data=file.read()
    match = re.sub(r'(<input id="wschatUrl"[^>]*value\s*=\s*["\'])(.+?)(["\']\s*[^>]*>)', r"\1" + url + r"\3",data)
    match = re.sub(r'(<div id="wschat-admin"[^>]*pipelineLink\s*=\s*["\'])(.+?)(["\']\s*[^>]*>)', r"\1" + pipe_url + r"\3",match)
    #print(match)

with codecs.open(fileName, 'w', 'utf-8') as file:
    file.write(match)