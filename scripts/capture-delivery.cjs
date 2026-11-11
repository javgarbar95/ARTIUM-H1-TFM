const { chromium, expect } = require('@playwright/test');
const fs = require('node:fs/promises');
const path = require('node:path');
(async () => {
 const out=path.resolve('docs/evidencias/entrega-2026-11-11');await fs.mkdir(out,{recursive:true});
 const browser=await chromium.launch({executablePath:process.env.CHROMIUM_PATH||'/usr/bin/chromium',args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:393,height:1000},deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const shot=async(name)=>{await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(600);await page.screenshot({path:path.join(out,name)});};
 await page.goto('http://localhost:8081');await page.getByRole('button',{name:'Entrar como estudiante demo',exact:true}).waitFor();await shot('01-acceso-demo.png');
 await page.getByRole('button',{name:'Entrar como estudiante demo',exact:true}).click();await expect(page.getByText('Obras de la comunidad')).toBeVisible();await shot('02-exploracion.png');
 await page.getByRole('tab',{name:'Buscar',exact:true}).click();await page.getByRole('textbox',{name:'Buscar obras o artistas'}).fill('Órbita');await page.getByRole('button',{name:'UPV',exact:true}).click();await shot('03-busqueda.png');
 await page.getByRole('tab',{name:'Perfil',exact:true}).click();await expect(page.getByText('Mi biblioteca',{exact:true})).toBeVisible();await shot('04-biblioteca-personal.png');
 await page.getByRole('tab',{name:'Portfolio',exact:true}).click();await page.getByRole('button',{name:'Vista previa y PDF',exact:true}).click();await page.getByText('SELECCIÓN DE OBRA / GALERÍA',{exact:true}).filter({visible:true}).last().scrollIntoViewIfNeeded();await shot('05-portfolio-galeria.png');
 await page.getByRole('button',{name:'Volver',exact:true}).click();await page.getByRole('button',{name:'Editar portfolio',exact:true}).click();await page.getByRole('button',{name:'Editorial · Vertical',exact:true}).click();await page.getByRole('button',{name:'Guardar portfolio',exact:true}).click();await page.getByRole('button',{name:'Vista previa y PDF',exact:true}).click();await page.getByText('SELECCIÓN DE OBRA / EDITORIAL',{exact:true}).filter({visible:true}).last().scrollIntoViewIfNeeded();await shot('06-portfolio-editorial.png');
 await page.getByText('Entre planos',{exact:true}).filter({visible:true}).last().scrollIntoViewIfNeeded();await shot('07-portfolio-editorial-detalle.png');
 if(errors.length)throw new Error(errors.join('\n'));
 await fs.writeFile(path.join(out,'capturas.json'),JSON.stringify({date:new Date().toISOString(),source:'Ejecución web auxiliar de React Native/Expo; no Android ni iOS',viewport:{width:393,height:1000},pageErrors:errors,files:await fs.readdir(out)},null,2));
 await browser.close();console.log('Capturadas 7 pantallas reales; cero errores de página.');
})();
