import zipfile
import os

zip_path = '/Users/jmpark/Downloads/ExportBlock-5e909fa0-0e17-4b04-aa32-5f1a2b135a59-Part-1.zip'
output_dir = '/Users/jmpark/Downloads/notion-export'

os.makedirs(output_dir, exist_ok=True)

with zipfile.ZipFile(zip_path, 'r') as z:
    for name in z.namelist():
        # 파일명 디코딩 시도
        try:
            decoded = name.encode('cp437').decode('utf-8')
        except:
            try:
                decoded = name.encode('cp437').decode('euc-kr')
            except:
                decoded = name
        
        if decoded.endswith('.csv'):
            # 파일에서 ID 추출 (마지막 32자 UUID 또는 ID 패턴)
            parts = decoded.split()
            for part in parts:
                if len(part) >= 32 and part.replace('-', '').isalnum():
                    output_name = part
                    break
            else:
                output_name = os.path.basename(decoded)
            
            output_path = os.path.join(output_dir, output_name)
            with z.open(name) as f:
                content = f.read()
                with open(output_path, 'wb') as out:
                    out.write(content)
            print(f'Extracted: {output_name}')

print('\nCSV files extracted to:', output_dir)
