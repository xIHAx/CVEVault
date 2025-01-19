import requests
import os
url = 'https://github.com/CVEProject/cvelistV5/releases/download/cve_2025-01-19_0600Z/2025-01-19_all_CVEs_at_midnight.zip.zip'


response = requests.get(url)
file_Path = "cve"
print(os.getcwd())
if response.status_code == 200:
    with open(file_Path, 'wb') as file:
        for chunk in response.iter_content(chunk_size=100):
            file.write(chunk)
    print('File downloaded successfully')
else:
    print('Failed to download file')