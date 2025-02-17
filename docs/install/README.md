# Guia de instalação
### Dependencias e bibliotecas
- Baixar os repositórios do backend, frontend e portal
- Instalar mysql
- Instalar nodejs 
- Instalar npm
- Instalar pm2
- Instalar angular cli
- Instalar nginx

### Instalação

- Criar pasta para os projetos
- criar pasta para uploads

``` sh
mkdir -p /var/www/cadernos
mkdir -p /var/www/front
mkdir -p /var/www/portal
mkdir -p /var/www/uploads
```

- Criar aquivo nginx em sites-available

```bash
nano /etc/nginx/sites-available/homolgacao.algartelecom.com.br
```

```nginx
server {
	listen 80;
	server_name  homolgacao.algartelecom.com.br;
	access_log  /var/log/nginx/host.access.log ;
	
	# backend
	location /api/{
		proxy_pass http://127.0.0.1:8080/;
		proxy_set_header Host $host;
		proxy_set_header X-Real-IP $remote_addr;
		proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
		proxy_set_header X-Forwarded-Proto $scheme;
		rewrite ^/api/(.*)$ /$1 break;
	}

	# portal
	location /{
		root /var/www/portal;
		index index.html;
		try_files $uri $uri/ /index.html;
	}

	# Sistema de cadernos
	location /admin{
		alias /var/www/cadernos/;	
		index index.html;
		try_files $uri $uri/ /admin/index.html;
	}
	
	# Imagens 
	location /uploads/{
		alias /var/www/uploads/;
		try_files $uri @uploads;
	}	
}
```
- Copiar link simbolico para sites-enabled

```bash
ln -s /etc/nginx/sites-available/homolgacao.algartelecom.com.br /etc/nginx/sites-enabled/homolgacao.algartelecom.com.br
```
- Carregar configurações do nginx

```bash
systemctl reload nginx
```


### Script de atualização 

```bash
#!/usr/bin/sh
echo on

SRC_PORTAL="/root/portal-homologacao-cdt"
SRC_CADERNO="/root/frontend-cadernos"
SRC_BACK="/root/backend-cadernos"

DST_PORTAL="/var/www/portal"
DST_CADERNO="/var/www/cadernos"
DST_BACK="/var/www/back"

gituser= <inserir o usuário>
token= <inserir o token>

URL_CADERNO="https://$gituser:$token@github.com/Coordenacao-de-Operacoes-de-Rede/frontend-cadernos.git"
URL_PORTAL="https://$gituser:$token@github.com/Coordenacao-de-Operacoes-de-Rede/portal-homologacao-cdt.git"
URL_BACK ="https://$gituser:$token@github.com/Coordenacao-de-Operacoes-de-Rede/backend-cadernos.git"


###########################################################################################################
echo "Atualizando Back-end"
echo "Interromper backend"
pm2 stop index
echo Apagar atual
rm -r -f $DST_BACK
cd $SRC_BACK
git reset --hard HEAD
git clean -fd
# atualizar back
git pull
# instalar dependencias portal
npm install
cp -r $SRC_BACK $DST_BACK
cd $DST_BACK
ln -s /var/www/uploads /var/www/back/uploads
# restarta o backend
pm2 start index.js

###########################################################################################################

echo ""
echo ""
echo "Frontend caderno"
echo ""
echo ""
rm -r -f $DST_CADERNO
cd $SRC_CADERNO
git reset --hard HEAD
git clean -fd
git pull
# instalar bibliotecas node
npm install
# compilar portal
ng build -c production
cp -r $SRC_CADERNO/dist/frontend $DST_CADERNO

###########################################################################################################

echo ""
echo ""
echo "Frontend Portal"
echo ""
echo ""

rm -r -f $DST_PORTAL
cd $SRC_PORTAL
git reset --hard HEAD
git clean -fd
# atualizar portal
git pull
# instalar dependencias portal
npm install
# compilar portal
ng build -c production
# Copiar arquivos
cp -r $SRC_PORTAL/dist/portal $DST_PORTAL

```
