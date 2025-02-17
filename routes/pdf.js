module.exports = (app) => {
    const puppeteer = require('puppeteer');
    const moment = require('moment-timezone');
    const fs = require('fs');
    const path = require("path");
    const { Op } = require("sequelize");
    const default_png = fs.readFileSync(path.resolve("uploads/default.png")).toString('base64')
    let html_book = '';

    const formatDates = function (date) {
        return date ? moment.tz(date, 'America/Sao_Paulo').format('DD/MM/YYYY') : "xx/xx/xxxx";
    }

    const formatDatesHOUR = function (date) {
        return date ? moment.tz(date, 'America/Sao_Paulo').format('DD/MM/YYYY HH:mm:ss') : "xx/xx/xxxx";
    }

    const prepareHTML = function (html) {
        // html = html.replaceAll('<img src="/uploads/', '<img src="http://127.0.0.1/uploads/');
        html = html.replaceAll('<h2>', '<h2 class="title">')
        html = html.replaceAll('<h3>', '<h3 class="title">')
        html = html.replaceAll('<h4>', '<h4 class="title subtitle">')
        return html;
    }

    const makeHeader = (MODELO, VERSION, VENDOR, DEVICE, ID) => {
        const imgAlgar = fs.readFileSync(path.resolve(__dirname, "../printBook/img/Algar.png")).toString('base64')
        const imgCDT = fs.readFileSync(path.resolve(__dirname, "../printBook/img/CDT_Logo.png")).toString('base64')

        const style_th = 'border: 1px solid black;word-wrap: break-word;'
        const headerTemplate = `<div style="width: 90%; height:150px;  position: fixed; left:5%; padding:0; text-align: center; font-size: 12pt;">
             <table style="border-spacing:0;border-collapse:collapse">
                <thead style="width: 100%;text-align: center; " >
                    <tr style="line-height: 1;">
                        <th colspan="2" style="${style_th}"><img src="data:image/png;base64,${imgAlgar}" alt="logo-algar"> </th>
                        <th colspan="2" style="${style_th} width: 60%;"> Caderno de Testes de ${MODELO}<br>${VENDOR} ${DEVICE}</th>
                        <th colspan="2" style="${style_th}"> <img src="data:image/png;base64,${imgCDT}" alt="logo-cdt" width="95px"> </th> 
                    </tr>
                    <tr style="line-height: 1.4;" > 
                        <th style="${style_th}" > Emitido por: </th>
                        <th style="${style_th}" > CDT </th>
                        <th style="${style_th}" > Centro de Desenvolvimento Tecnológico </th>
                        <th style="${style_th}" > Versão <br> ${VERSION} </th>
                        <th style="${style_th}" > Data de Emissão ${formatDates(new Date())} </th>
                    </tr>
                </thead>
            </table>
        </div>`
        const footerTemplate = `<div style="width: 95%; font-size: 10px; margin-left:0%;">
<table style="border-spacing: 0; border-collapse: collapse; width: 100%;">
    <thead>
        <tr>
            <th style="text-align: center; ">
                Elaborado por CDT - Centro de Desenvolvimento de Tecnologia - Este documento é confidencial e de uso interno
            </th>
            <th style="text-align: right;">
                Página <span class="pageNumber"></span> de <span class="totalPages"></span>
            </th>
        </tr>
        <tr>
            <th colspan="2" style="text-align: center;">
                ${ID}
            </th>
        </tr>
    </thead>
</table>
</div>`
        return { headerTemplate, footerTemplate }
    }

    const generatePDF = async (idPdf) => {
        const log = await app.models.logPdf.findByPk(idPdf);
        // Se o PDF já foi visualizado
        // if (log.viewed) {
        //     throw new Error("Caderno não encontrado");
        // }

        await log.update({ viewed: true });

        let book = {};
        if (log.book_id !== null) {
            book = await app.models.books.findOne({
                where: { id: log.book_id },
                include: [{
                    model: app.models.versions,
                    include: [
                        { model: app.models.models },
                        {
                            model: app.models.features, as: 'versionDetails',
                            include: { model: app.models.response_features, where: { book_id: log.book_id } }
                        },
                        {
                            model: app.models.items,
                            as: 'versionItems',
                            include: [
                                { model: app.models.response_items, where: { book_id: log.book_id } },
                                {
                                    model: app.models.fields,
                                    include: {
                                        model: app.models.type_fields,
                                        as: 'fieldType'
                                    }
                                }
                            ]
                        },
                    ]
                },
                {
                    model: app.models.equipaments
                },
                {
                    model: app.models.statusBook
                },
                { model: app.models.users, as: 'user_responsible' },
                { model: app.models.users, as: 'user_executor' },
                ],
            });
            if (!book) res.status(400).json({ message: "Book não encontrado" });
            book = book.toJSON();
            for (const feature of book.version.versionDetails) {
                if (feature.response_features.length > 0) {
                    feature.response_feature = feature.response_features[0];
                }
                feature.response_features = undefined;
            }
            for (const item of book.version.versionItems) {
                if (item.response_items.length > 0) {
                    item.response_item = item.response_items[0];
                }
                item.response_items = undefined;
                if (!item.fillable) continue;
                for (const field of item.fields) {
                    const responseField = await app.models.response_fields.findOne({
                        where: { field_id: field.id, response_item_id: item.response_item.id },
                        include: { model: app.models.images }
                    });
                    field.response_field = responseField.toJSON();
                }
            }
        } else {
            book.version = await app.models.versions.findOne({
                where: { id: log.version_id },
                include: [
                    { model: app.models.models },
                    {
                        model: app.models.features, as: 'versionDetails',
                    },
                    {
                        model: app.models.items,
                        as: 'versionItems',
                        include: [
                            {
                                model: app.models.fields,
                                include: {
                                    model: app.models.type_fields,
                                    as: 'fieldType'
                                }
                            }
                        ]
                    },
                ],
            });

            if (!book.version) res.status(400).json({ message: "Versão não encontrada" });

            book.version = book.version.toJSON();
            book.equipament = {
                name: 'Equipamento',
                vendor: 'Fabricante',
            }
            book.status = "Rascunho";
            book.statusBooks = []

            book.user_executor = {
                name: 'Executor',
                company: 'Empresa Executora'
            }
            book.user_responsible = {
                name: 'Responsável',
            }
            for (const item of book.version.versionItems) {
                if (!item.fillable) continue;
                item.fields.sort((a, b) => a.order_field - b.order_field);
                for (const field of item.fields) {
                    if (field.response_field_id !== null) {
                        field.response_field = {
                            response: field.standard_value,
                            images: [{ path: 'uploads/evidence.png' }]
                        }
                    }
                }
            }
            for (const feature of book.version.versionDetails) {
                feature.response_feature = { response: '' }
            }

        }
        book.versions = await app.models.versions.findAll({
            raw: true,
            nest: true,
            where: {
                model_id: book.version.model_id, version: {
                    [Op.lte]: book.version.version
                }
            },
            include: [
                { model: app.models.users },
            ],
            order: [['version', 'ASC']],
        });

        for (const item in book.version.versionItems) {
            let fullOrder = ""
            if (!book.version.versionItems[item].is_subitem) {
                fullOrder = String(book.version.versionItems[item].order)
            } else {
                let i = book.version.versionItems[item]
                fullOrder = String(book.version.versionItems[item].order)
                while (i.is_subitem != false) {
                    fid = i.father_id
                    i = await app.models.items.findOne({
                        where: {
                            id: fid
                        }
                    })
                    fullOrder = String(i.order) + "." + fullOrder;
                }
            }
           
            book.version.versionItems[item].fullorder = fullOrder;
            console.log(book.version.versionItems[item]);
        }

        


        //book.version.versionItems.sort((a, b) => a.order - b.order) //
        book.version.versionItems.sort((a, b) => {
            const orderA = a.fullorder;
            const orderB = b.fullorder;
            return orderA.localeCompare(orderB, "en", { numeric: true });
        })
        book.version.versionDetails.sort((a, b) => a.order - b.order)

        for (const item in book.version.versionItems) {
            console.log(book.version.versionItems[item]);
        }

        let head = '';
        let itensHtml = '';
        let page1 = '';
        let page2 = '';
        let page3 = '';
        let page4 = '';
        let page5 = '';
        let page6 = '';
        let page7 = '';
        head = `<!doctype html>
        <html lang="pt-br">
        <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="/api/pdf.css">
        <link rel="stylesheet" href="/api/webpdf.css">
        <title> Caderno de Testes de ${book.version.model.title} ${book.equipament.vendor} ${book.equipament.name}
        </title>
        </head>`;
        if (book.status == "Pendente")
            head = head + `<style> .headerGroup:after { content: "CADERNO NÃO FINALIZADO"; } </style>`
        else if (book.status == "Cancelado")
            head = head + `<style> .headerGroup:after { content: "CADERNO CANCELADO"; } </style>`
        else if (book.status == "Revogado")
            head = head + `<style> .headerGroup:after { content: "CADERNO REVOGADO"; } </style>`
        else if (book.status == "Rascunho")
            head = head + `<style> .headerGroup:after { content: "CADERNO MODELO "; } </style>`
        head += `<body>
        <div class="content-wrapper">
        <table>
         <thead>
    <tr>
        <td class="headerGroup td"> <div class="header-block"></div> </td>
    </tr>
    </thead>
        <tfoot> <tr> <td class="footerGroup td"> <div class="footer-block"></div> </td> </tr></tfoot>
        <tbody> 
        <tr> <td class="td"> <div class="page-container">`;

        page1 = `<div class="page center">
            <table class="main-table">
                <thead><tr><th class="row-title">Caderno de Testes de ${book.version.model.title}</th></tr> </thead>
                <tbody> 
                    <tr> 
                        <td class="td"> <span class="row-title"> Última Atualização do Caderno de Testes:</span><span> ${formatDates(book.version.updatedAt)}</span> </td> 
                    </tr>
                    <tr>
                        <td class="td"> <span class="row-title">Versão do Caderno de Testes:</span> <span>${book.version.version}</span></td>
                    </tr>
                    <tr> 
                        <td class="td"> <span class="row-title">Responsável Algar Telecom:</span> <span>${book.user_responsible.name}</span></td>
                    </tr>
                    <tr>
                        <td class="td"> <span class="row-title">Empresa credenciada executora: </span><span>${book.user_executor.company}</span></td>
                    </tr>
                    <tr> 
                        <td class="td"> <span class="row-title">Especialista credenciado executor: </span><span>${book.user_executor.name}</span> </td> 
                    </tr>
                    <tr> 
                        <td class="td"> <span class="row-title">Período de execução dos testes: </span> <span>${formatDates(book.start_date)} a ${formatDates(book.end_date)}</span> </td> 
                    </tr>
                </tbody>
            </table>
            <div class="main-title">
                <h1>CADERNO DE TESTES</h1>
                <h1>${book.version.model.title}</h1>
                <h1 class="main-title">${book.equipament.vendor} - ${book.equipament.name}</h1>
                <h1>Algar Telecom</h1>
            </div>
            </div> <div class="page">`

        const versionsByModelHtml = book.versions.map((version) => {
            return `
          <tr>
              <td class="td">${formatDates(version.updatedAt)}</td>
              <td class="td">${version.version}</td>
              <td class="td">${version.user.name}</td>
              <td class="td">${version.comment}</td>
          </tr>`;
        }).join('');
        page2 = `<h2 class="title">CONTROLE DE VERSÃO DO CADERNO DE TESTES</h2>
        <div>
            <table class="secondary-table">
                <thead>
                    <tr>
                        <th>Data</th>
                        <th>Versão</th>
                        <th>Autor</th>
                        <th>Alterações</th>
                    </tr>
                </thead>
                <tbody> ${versionsByModelHtml}</tbody>
            </table>
            </div>
        </div>`;

        const itemsByVersionHtml = book.version.versionItems.map((item) => {
            return `<li style="list-style-type: none;"> <a class="a" href="#${item.fullorder}"> ${item.fullorder} - ${item.title.toUpperCase()}</a></li>`;
        }).join('');

        page3 = `<div class="page"><h2 class="title"> SUMÁRIO </h2> <ol class="summary-list ol">
        ${itemsByVersionHtml}
        </ol> </div>`;

        const testes = book.version.versionItems.filter((item) => {
            return item.fillable;
        })
        const htmlResumoTeste = testes.map((test) => {
            test.approvalStatus = test.response_item ? test.response_item.status : 'Aprovado/Reprovado';
            test.comment = test.response_item ? test.response_item.comment : '';
            // verificar se é mandatorio
            const isMandatory = test.mandatory ? 'Sim' : 'Não';
            return `<tr>
                <td class="td">${test.title.toUpperCase()}</td>
                <td class="td">${isMandatory}</td>
                <td class="td">${test.approvalStatus}</td>
                <td class="td">${test.comment}</td>
                </tr>`;

        }).join('');


        page4 = `
    <div class="page">
        <h2 class="title"> RESUMO DOS TESTES </h2>
        <table class="secondary-table">
        <thead>
        <tr>
            <th>Teste</th>
            <th>Mandatório</th>
            <th>Resultado</th>
            <th>Observação</th>
        </tr>
        </thead>
        <tbody>${htmlResumoTeste}</tbody>
        </table>
    </div>`

        const featureAnswerHTML = book.version.versionDetails.map((feature) => {
            return `<tr><td class="td">${feature.name}</td><td class="td">${feature.response_feature.response}</td>`;
        }).join('\n');

        page5 = `<div class="page">
        <h2 class="title" id="h2_caracteristicas">CARACTERÍSTICAS DO EQUIPAMENTO</h2>
        <!-- Consulta todos os items with fillable true by version_id order by order // consulta os response_items --> 
        <table class="secondary-table">
        <thead>
            <tr>
                <th> Característica </th>
                <th> Resultado </th>
            </tr>
            </thead>
        <tbody> ${featureAnswerHTML}</tbody>
        </table>
        </div>`;

        itensHtml = book.version.versionItems.map(item => {
            // verificar se o item não é um teste
            if (item.fillable == false) {
                return `<div class="item" id="${item.fullorder}">
                <h3 class="title"><li style="list-style-type: none;">${item.fullorder} - ${item.title}</li></h3>
                <div>${prepareHTML(item.description)}</div>`

            }

            return `<div class="item" id="${item.fullorder}">
                <h3 class="title"><li style="list-style-type: none;">${item.fullorder} - ${item.title}</li></h3>
                <div>
                    ${prepareHTML(item.description)}
                </div>
                <div><h4 class="title subtitle"> Evidências </h4>`
                + item.fields.map(field => {
                    let tempText = field.response_field.response;
                    if (field.fieldType.tag === 'text') {
                        return `<div>${field.title_field}:<p class="p">${tempText}</p></div>`;
                    } else if (field.fieldType.tag === "longtext") {
                        return `<div> ${field.title_field}:<br><div class="longtext">${tempText}</div></div>`
                    } else if (field.fieldType.tag === "script") {
                        return `<div>${field.title_field}:<br><div class="code-div"> ${tempText} </div></div>`
                    } else if (field.fieldType.tag === "image") {
                        return `<div class="image-evidence">` +
                            field.response_field.images.map(image => {
                                let image64;
                                try {
                                    image64 = fs.readFileSync(path.resolve('/var/www'+image.path)).toString('base64')
                                } catch (e) {
                                    image64 = default_png;
                                    console.error(e)
                                }
                                return `
                                <div class="figure">
                                <img src="data:image/png;base64,${image64}"><br>
                                <span >${field.title_field}</span>
                                </div>`;
                            }).join('\n') + `</div>`;

                    }

                    return '';
                }
                ).join('\n') +
                // mostrar se o Item foi aprovado ou não
                `</div><div>Teste ${item.approvalStatus}. ${item.comment}</div></div>`

        }).join('\n')

        page6 = `<div class="page"><h2 class="title">CADERNO DE TESTES</h2> <ol class="summary-list ol"> <!-- Item --> ${itensHtml} </ol> </div>  `
        page7 = `<div class="page">
        <h2 class="title" id="h2_conclusao">CONCLUSÃO</h2>
        <p class="p"> Este caderno de teste é utilizado como uma referência para os testes que deverão ser executados durante a homologação dos equipamentos, sendo que, é de inteira responsabilidade do fabricante, criar um documento com as seguintes informações: <ul class="ul">
        <li> Este documento preenchido; </li>
        <li> Logs que comprovem os testes; </li>
        <li> Todas as evidências dos testes que não podem ser anexadas diretamente neste arquivo devem ser enviadas separadamente e atreladas a este documento; </li>
        <li> Documentos detalhados que são solicitados e que compõem a entrega da homologação. </li> </ul>
        </p>`
        page7 += `Por meio dos resultados obtidos em laboratório e documentados neste <b>Caderno de Testes de ${book.version.model.title}</b> consideramos o equipamento <b> ${book.equipament.vendor} ${book.equipament.name}</b> como <b>${book.status}</b> para operar na Algar Telecom, de acordo com os requisitos deste caderno.`
        if (book.length > 0) {
            page7 += `<h4 class="title subtitle">Observação</h4>`
        }
        page7 += book.statusBooks.map(status => {
            return `<p class="p">${formatDatesHOUR(status.updatedAt)} - ${status.status}. ${status.comment}</p>`
        }).join('\n')


        const html = head + page1 + page2 + page3 + page4 + page5 + page6 + page7;
        html_book = html;
        // await page.addStyleTag({ path: './printBook/print.css' })

        const { headerTemplate, footerTemplate } = makeHeader(book.version.model.title, book.version.version, book.equipament.vendor, book.equipament.name, log.id)

        const bookTitle = `Caderno de Testes de ${book.version.model.title} V ${book.version.version} ${book.equipament.vendor} ${book.equipament.name}`;
        return { html, headerTemplate, footerTemplate, bookTitle };
    }

    app.get('/lastpdf', async (req, res) => {
        res.send(html_book);
    });
    app.get('/webpdf.css', async (req, res) => {
        res.sendFile(path.join(__dirname, '../printBook/webpdf.css'));
    })
    app.get('/pdf.css', async (req, res) => {
        res.sendFile(path.join(__dirname, '../printBook/pdf.css'));
    })
    app.post("/createPDF", app.auth.hasUser, async (req, res) => {
        let { book_id, version_id } = req.body;
        try {
            let description = null;
            if (book_id) {
                const book = await app.models.books.findByPk(book_id, { include: [{ model: app.models.versions, include: [{ model: app.models.models }] }, { model: app.models.equipaments }] });
                if (!book) {
                    return res.status(400).json({ message: 'Caderno não econtrado' });
                }
                if (book.status === 'Pendente' && !req.hasUser) {
                    return res.status(400).json({ message: 'Caderno ainda não disponível' });
                }
                version_id = book.version_id;
                description = `Caderno ${book.version.model.title}  V${book.version.version} ${book.equipament.vendor} ${book.equipament.name}`;
            }
            let version = await app.models.versions.findByPk(version_id, { include: [{ model: app.models.models }] });
            if (!version)
                return res.status(400).json({ message: "Versão não encontrada" });
            if (description === null) {
                description = `Modelo ${version.model.title} V${version.version}`;
            }
            const model_id = version.model_id;
            const log = await app.models.logPdf.create({
                user_ip: req.headers['x-real-ip'],
                user_id: req.userId,
                book_id: book_id,
                model_id: model_id,
                version_id: version_id
            });

            app.log.register(app.log.actions.generatePDF, req.userId || 0,
                `"${log.user_ip}" Gerou pdf do "${description}"`,
                { version_id: log.version_id, book_id: log.book_id, model_id: log.model_id, log_pdf_id: log.id },);

            return res.status(201).json(log);
        } catch (e) {
            return res.status(400).json({ message: 'Erro desconhecido' });
        }
    })



    app.get('/downloadpdf/:idPdf', async (req, res) => {
        try {
            const { html, headerTemplate, footerTemplate, bookTitle } = await generatePDF(req.params.idPdf);
            const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
            const page = await browser.newPage();

            await page.setContent(html);
            await page.addStyleTag({ path: './printBook/pdf.css' })
            await page.evaluateHandle('document.fonts.ready');
            // create a PDF buffer
            const pdf = await page.pdf(
                {
                    format: 'a4',
                    displayHeaderFooter: true,
                    headerTemplate: headerTemplate,
                    footerTemplate: footerTemplate,
                    margin: { top: 175, bottom: 60, },
                    timeout: 0
                }
            );
            await browser.close();
            res.setHeader('Content-Type', "application/pdf");
            res.setHeader('Content-Disposition', `inline; filename="${bookTitle}.pdf"`);
            return res.send(pdf);
        } catch (e) {
            return res.status(400).json({ e: e.toString() })
        }
    });
    app.get('/pdf/:idPdf', async (req, res) => {
        try {
            const { html, headerTemplate, footerTemplate } = await generatePDF(req.params.idPdf);
            return res.send(html);
        } catch (e) {
            return res.status(400).json({ e: e.toString() })
        }
    });

};
