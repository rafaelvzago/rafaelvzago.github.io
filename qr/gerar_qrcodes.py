import qrcode
import csv
import json
import os

# Caminho para o diretório 'qr'
qr_dir = os.path.dirname(os.path.abspath(__file__))

# Dicionário para armazenar o mapeamento de IDs para URLs
url_map = {}

# Ler o arquivo urls.txt e gerar os QR codes
with open(os.path.join(qr_dir, 'urls.txt'), 'r') as file:
    reader = csv.reader(file)
    for row in reader:
        id = row[0].strip()
        url = row[1].strip()

        # Adicionar ao mapeamento
        url_map[id] = url

        # Dados que serão codificados no QR code (URL do site com o ID)
        qr_data = f'https://www.rafaelvzago.com/qr/?id={id}'

        # Gerar o QR code
        img = qrcode.make(qr_data)

        # Salvar o QR code como uma imagem PNG
        img.save(os.path.join(qr_dir, f'qrcode_{id}.png'))

# Salvar o mapeamento em um arquivo JSON para uso no frontend
with open(os.path.join(qr_dir, 'urls.json'), 'w') as json_file:
    json.dump(url_map, json_file)

