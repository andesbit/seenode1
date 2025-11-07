 import { existsSync, readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DBPATH = join(__dirname, '../../DB/');

export function obtenerCentena(numero) {
    return Math.ceil(numero / 100) * 100;
}

export function getNumUsersDB()
{
    const filepath = join(DBPATH, "PROPERTIES.json");
    //console.log("--filepath----->",filepath)
    let dbconf = JSON.parse(readFileSync(filepath, 'utf8'));
    //console.log(".]",dbconf) 
    const nusers = dbconf.nusers;
    //console.log(".]",nusers) 
    return nusers
}

function aMayusculasSinAcentos(cadena) {
    return cadena
        .normalize('NFD') // Separa caracteres y acentos
        .replace(/[\u0300-\u036f]/g, '') // Elimina los acentos
        .toUpperCase(); // Convierte a mayúsculas
}

export function collectionDB(collection)
{
    let content = []
    let filename =  "D" + "100" + ".json";
    let filepath = DBPATH + collection + "/" + filename;
       
    //LEERDATAFILE(){   //TECH FUNCIONES INTRINCECAS
    let offers = JSON.parse(readFileSync(filepath, 'utf8'));

    for (let u in offers)
    {            
      content.push({id:offers[u].ole, name:offers[u].fname, offer:offers[u].offer,  email:offers[u].email})
    }

    return content ;//
}

//Sólo llamar en cambio de nElemsPerPages
function preparePaginationDB(collection){

    //NUMERO DE DOCUMENTOS POR CADA CENTENA:
    let filename =  "INFOCENTENAS.json";
    let filepath = DBPATH + collection +"/INFO/" + filename;
    let infoCentenas = JSON.parse(readFileSync(filepath, 'utf8'));

    //HACER EL CONTEO
    
    //ESCRIBIR LIMITES DE CADA PAGINA:

}

function limitsPage(collection, page)
{
    let filename =  "INFOCENTENAS.json"
    let filepath = DBPATH + collection +"/INFO/" + filename
    let infoCentenas = JSON.parse(readFileSync(filepath, 'utf8'))
    let obj = infoCentenas.find(objeto => objeto.page === page)
    return obj
}

function infoPage(collection, page)
{
    //SE PODRIA CREAR DINAMICAMENTE CON LIMITSPAGE
    //QUE NO ESTE EN UN ARCHIVO
    //PERO AHORA ES CONVENIENTE LIMITAR A UN NUMERO FIJO

    let filename =  "INFOPAGES.json"
    let filepath = DBPATH + collection +"/INFO/" + filename
    let infoCentenas = JSON.parse(readFileSync(filepath, 'utf8'))
    let obj = infoCentenas.find(objeto => objeto.page === page)
    if (typeof obj === "undefined") 
    return{
        page: 1,
        centena: 100,
        start: 1
    }
    else    
    return obj
}

export function getNumPagesDB(nElementsPag)
{
    let nPages = 0//6    
    let nUsers = getNumUsersDB()
    nPages = Math.trunc(nUsers/nElementsPag);
    let residuo = nUsers/nElementsPag
    if(residuo > 0)nPages++
    return nPages
}

export function pagesDB(collection, page, nOffersPage)
{
    let content = []
    //let centena = page * 100;
    //let PERPECLETO=3
    
    //if(PERPECLETO==3){
    //console.log("ÂGESDBPERPLE3")

    let obj_page =       infoPage(collection, page) // EXTRAERDE:collection/INFO/INFOPAGES
    let centena =        obj_page.centena // INICIA EN CENTENA...
    let str_centena =    centena.toString()
    let filename =       "D" + str_centena + ".json";
    let filepath =       DBPATH + collection + "/" + filename;
    // console.log("PER",filepath)
    let offers =         JSON.parse("{}");
    let count_offers =   0
    
    let saltear = 0;
    
    saltear = obj_page.start;//EN EL QUE EMPIEZA LA PAGINA

    while(count_offers < nOffersPage) 
    {
        str_centena = centena.toString()
        filename =  "D" + str_centena + ".json";
        filepath = DBPATH + collection + "/" + filename;
        
        if (existsSync(filepath)) 
        {
            offers = JSON.parse(readFileSync(filepath, 'utf8'));


            for (let u in offers) {            
                if(saltear) saltear--
                else
                {                
                    count_offers++
                    if(count_offers > nOffersPage)break
                    else {
                        let qobj={
                            id:offers[u].ole,
                            name:offers[u].name, 
                            offer:offers[u].offer,
                            espe:offers[u].espe,
                            email:offers[u].email
                        }
                        //console.log("pagesDB",qobj)
                        content.push(qobj)
                    }    
                }
            }
            //taltaqu SIGUINTE CENTENA
            centena += 100;
        }
        else{
            break; //NO HAY MAS ARCHIVOS
        }
    }
    return content;//}//PERPECLETO
}

export function preSearchInDB (collection, field, value) 
{
    const twoletters = aMayusculasSinAcentos( value.slice(0,2) );
    const cap_field = aMayusculasSinAcentos( field )
    const ruta = DBPATH + collection + "/INDEX/" + cap_field +"/"+ twoletters + ".json";
    const objs = JSON.parse(readFileSync(ruta, 'utf8'));
    
    let content = []
                     //CAMPO EJ:EMAIL   
    for(let i in objs)//RECORRER CENTENAS QUE TIENE SUS IDS
    {
        let obj_centena = objs[i];//CADA CENTENA
        console.log(obj_centena.ids)
        let filename =  "D" + obj_centena.centena + ".json";

        let filepath = DBPATH + collection + "/" + filename;
       
        //LEER CENTENA
        let offers = JSON.parse(readFileSync(filepath, 'utf8'));

        for (let u in offers)//GUARDAR LOS OBJETOS CON ID QUE PERTENECE A IDS SELECCIONADOS
        {            
            if(obj_centena.ids.includes(offers[u].ole))
            {
                //content += offers[u].ole +":" + offers[u].fname +"<br>";
                content.push({id:offers[u].ole, name:offers[u].fname, email:offers[u].email})
            }            
        }
    }    
    return content ;//
};

export function searchEmailDB(collection, email){
    ///·-indice de emails
    let id = 0
    const array = preSearchInDB(collection, "email", email)
    
    console.log("searchEmailDB-array",array)
    for(let i in array)
    {
        console.log("array[i].email",array[i].email,"array[i]",array[i])
        
        if(array[i].email===email) {
            id=array[i].id
            break
        }    
    }    
    return id;
}
export function searchIdDB(collection, id){
    let centena = obtenerCentena(id)
    let fileData = collection + "/D" + centena.toString() + ".json"
    let ipath = join(DBPATH, fileData)//"DATA/"data.json");
    //console.log(ipath) 
    let offers = JSON.parse(readFileSync(ipath, 'utf8'));
    //console.log(offers) 
    //console.log("IIIIIIIID",id) 
    let oid=parseInt(id) 
    const obj = offers.find(persona => persona.ole === oid);
    //console.log("====",obj); // Muestra { nombre: 'Ana', edad: 22 }
    return obj;  
}

//function encontrarElemento(array, clave, valor) {
//    return array.find(elemento => elemento[clave] === valor);
//}

function buscarInteligente(array, criterios, limiteParecidos = 3) {
    const resultados = {
        exactos: [],
        parecidos: []
    };    
    array.forEach(elemento => {
        let coincidenciaExacta = true
        let coincidenciaParecida = true        
        for (const clave in criterios) {
            const valorBuscado = criterios[clave]
            const valorElemento = elemento[clave]
            
            // Verificar coincidencia exacta
            if (valorElemento !== valorBuscado) {
                coincidenciaExacta = false;
            }
            
            // Verificar coincidencia parecida
            if (typeof valorElemento === 'string' && typeof valorBuscado === 'string') {
                if (!valorElemento.toLowerCase().includes(valorBuscado.toLowerCase())) {
                    coincidenciaParecida = false;
                }
            } else if (valorElemento != valorBuscado) {
                coincidenciaParecida = false;
            }
        }
        
        if (coincidenciaExacta) {
            resultados.exactos.push(elemento);
        } else if (coincidenciaParecida && resultados.parecidos.length < limiteParecidos) {
            resultados.parecidos.push(elemento);
        }
    });
    
    return resultados;
}

function buscarInteli(array, criterios, opciones = {}) 
{
    const {
        limiteParecidos = 5,
        incluirExactos = true,
        incluirParecidos = true
    } = opciones;

    const resultados = {
        exactos: [],
        parecidos: []
    };

    array.forEach(elemento => {
        let esExacto = true;
        let esParecido = true;

        for (const clave in criterios) {
            console.log("cccccccccccccccccccc",clave)
            const valorBuscado = criterios[clave];
            const valorElemento = elemento[clave];
            
            if (valorElemento === undefined){
                console.log("222","UNDEFINED")
                //continue;
                esExacto = false;
                esParecido = false;
            } 
            else{ 
                const valorBuscadoStr = String(valorBuscado).toLowerCase();
                const valorElementoStr = String(valorElemento).toLowerCase();

                // Coincidencia exacta
                if (valorElemento !== valorBuscado) {
                    esExacto = false;
                }

                // Coincidencia parecida
                if (!valorElementoStr.includes(valorBuscadoStr)) {
                    esParecido = false;
                }
            }
        }

        if (esExacto && incluirExactos) {
            resultados.exactos.push(elemento);
        } else if (esParecido && incluirParecidos && resultados.parecidos.length < limiteParecidos) {
            resultados.parecidos.push(elemento);
        }
    });

    return resultados;let offers = JSON.parse(readFileSync(filepath, 'utf8'));
}

function buscarFlexible(array, criterios, exacto = true) {
    return array.filter(elemento => {
        return Object.keys(criterios).every(clave => {
            const valorBuscado = criterios[clave];
            const valorElemento = elemento[clave];
            
            if (exacto) {
                return valorElemento === valorBuscado;
            } else {
                if (typeof valorElemento === 'string' && typeof valorBuscado === 'string') {
                    return valorElemento.toLowerCase().includes(valorBuscado.toLowerCase());
                }
                return valorElemento == valorBuscado;
            }
        });
    });
}

// Uso rápido
//const exactos = buscarFlexible(productos, { categoria: "Tecnología" }, true);
//const parecidos = buscarFlexible(productos, { nombre: "lap" }, false);

export function searchInDB (collection, field, value){
    const two_letters = aMayusculasSinAcentos( value.slice(0,2) );
    const cap_field = aMayusculasSinAcentos( field )
    const ruta = DBPATH + collection + "/INDEX/" + cap_field +"/"+ two_letters + ".json";
    
    //AGREGAR N
    console.log ("GGGGGGfield",field,"GGGGGGfield",value)

    if (existsSync(ruta)) 
    {
        const objs = JSON.parse(readFileSync(ruta, 'utf8'));
    }

    let content = []

    //for(let i in objs){        
    //    if(objs[i].field === value)
    //    {
    //        content.push(obj)
    //    }            
    //}

    let exactosCombinados = [];
    let parecidosCombinados = [];
    //exactosCombinados = exactosCombinados.concat(buscarInteli(productos, { nombre: "Lap" }).exactos);
    let busq = []
    
    // n búsquedas PRIMERO SOLO HABRÁ UN ARCHIVO
    console.log("------------------",{ [field]: value })
    busq = buscarInteli(objs, { [field]: value });
    exactosCombinados = [...exactosCombinados, ...busq.exactos];    
    parecidosCombinados = [...parecidosCombinados, ...busq.parecidos];
    //end buclek

    content = [...exactosCombinados, ...parecidosCombinados];
    //PRIMERO PARA MOSTRAR TODOS
    return content ;//
    //return busq.exactos
};

export function updateDB(collection, user_id,{offer})
{
    const centena = obtenerCentena(user_id)
    console.log("CENTENA",centena)
    let fileData = collection + "/D" + centena.toString() + ".json"
    let ipath = join(DBPATH, fileData)//"DATA/"data.json");
    
    let dataArray = [];

    // Leer y parsear el archivo existente
    if (existsSync(ipath)) {
        try {
            const fileContent = readFileSync(ipath, 'utf8');
            if (fileContent.trim() !== '') {
                dataArray = JSON.parse(fileContent);
                // Asegurarse de que sea un array
                if (!Array.isArray(dataArray)) {
                    dataArray = [];
                }
            }
        } catch (parseError) {
            console.warn('Error parsing JSON file, starting with empty array:', parseError);
            dataArray = [];
        }
    }

    // Buscar índice del objeto existente
    const existingIndex = dataArray.findIndex(item => item.ole === user_id);
    //console.log("==>>>>existingIndex: ",existingIndex)

    // Modificar objeto
    const newObject = {
        ole: 0,
        offer: "",
        updatedAt: new Date().toISOString() // Campo adicional para tracking
    };
    
    newObject.ole = user_id
    newObject.offer = offer

    dataArray[existingIndex] = newObject;
    writeFileSync(ipath, JSON.stringify(dataArray, null, 2), 'utf8');
}

function incrementUsers(){

    const filepath = join(DBPATH, "PROPERTIES.json");
    let num_users = getNumUsersDB()    
    num_users++
    let obj={
        nusers:num_users
    }
    writeFileSync(filepath, JSON.stringify(obj, null, 2), 'utf8');
    return num_users
}

function __changeInfos(collection, newObject) { 

    const nusers = incrementUsers()
    console.log("ole:",newObject.ole)
    let centena = obtenerCentena(newObject.ole)
    //console.log("centena:",centena)
    //centena = obtenerCentena(ole)
    //console.log(centena)
    let fileData = collection + "/INFO/INFOCENTENAS.json"
    let ipath = join(DBPATH, fileData)
    const fileContent = readFileSync(ipath,'utf8')
    let dataArray = JSON.parse(fileContent)
    const obj_index = dataArray.findIndex(item => item.centena === centena);//Se podría usar findIndex pero,,,
    dataArray[obj_index].have++ 
    //console.log(dataArray)
    //console.log( centena,obj)
    writeFileSync(ipath, JSON.stringify(dataArray,null,2),'utf8') 
    //(INFOCENTENASREALIZADO)TIL

    // ( ISJIMUNITIÑ )

    // (INFOPAGES LONTIL) IR A LA ULTIMA PAGINA O
    // ULTIMO OBJETO DE INFOPAGES & end_ole++    
    // SI end_ole-start_ole > 100, generar otra pagina

    fileData = collection + "/INFO/INFOPAGES.json"
    ipath = join(DBPATH, fileData)
    const fileContent2 = readFileSync(ipath,'utf8');
    dataArray = JSON.parse(fileContent2);

    //console.log("XXXXXXXXXXX",dataArray)
    const last = dataArray[dataArray.length - 1];
    
    if(last.end_ole - last.ini_ole < 100)
        dataArray[dataArray.length - 1].end_ole++;
    else
    {
        let new_obj = {
            page:4,
            ini_centena:2,
            start_in: 5, 
            ini_ole: 101,
            end_ole: 115 
        }; 
     
        dataArray.push(new_obj);
        // Escribir de vuelta al archivo
        
    }
    writeFileSync(ipath, JSON.stringify(dataArray, null, 2), 'utf8');
    console.log("INFO--NUSERS-->",nusers)
    return nusers
}

//------------------------------------------

function _writeIndex(collection, field, value, centena, ID)
{
    const twoletters = aMayusculasSinAcentos( value.slice(0,2) );
        
    let cap_field = aMayusculasSinAcentos( field )

    let fileData = collection + "/INDEX/" + cap_field +"/"+ twoletters + ".json"

    let ipath = join ( DBPATH, fileData )
    
    let data_objs = []

    if (existsSync(ipath)) {

        try {
            const fileContent = readFileSync(ipath, 'utf8');

            if (fileContent.trim() !== '') 
                {
                data_objs = JSON.parse(fileContent);
            }
        } catch (parseError) {
            console.warn('Error parsing JSON file, starting with empty array:', parseError);
        }
    }

    for(let i in data_objs )
        {
        if ( data_objs[i]. centena  === centena )
            {

            data_objs[i].ids.push(ID)

            break
         }    
    }
    // Escribir de vuelta al archivo
    writeFileSync(ipath, JSON.stringify(data_objs, null, 2), 'utf8');
}

//writeIndex(collection, "EMAIL", newObj.email, newObj)
function writeIndex(collection, field, value, obj)
{
    const twoletters = aMayusculasSinAcentos( value.slice(0,2) );
        
    let cap_field = aMayusculasSinAcentos( field )

    let fileData = collection + "/INDEX/" + cap_field +"/"+ twoletters + ".json"

    let ipath = join ( DBPATH, fileData )
    
    let data_objs = []

    if (existsSync(ipath)) {

        try {
            const fileContent = readFileSync(ipath, 'utf8');

            if (fileContent.trim() !== '') 
            {
                data_objs = JSON.parse(fileContent);
            }
        } catch (parseError) {
            console.warn('Error parsing JSON file, starting with empty array:', parseError);
        }
    }
    data_objs.push(obj)
    // Escribir de vuelta al archivo
    writeFileSync(ipath, JSON.stringify(data_objs, null, 2), 'utf8');
}

//------------------------------------------

export function addDocumentDB(collection,data)
{
    //const nusers = changeInfos(collection, data)
    const nusers = incrementUsers()
    const newObj = data//req.body;
   
    newObj.ole = nusers //getNumUsersDB()+1;ACALOCAMBIA
    newObj.name = "Usuario" + nusers.toString() //getNumUsersDB()+1;ACALOCAMBIA

    let centena = obtenerCentena(newObj.ole)
    let fileData = collection + "/D" + centena.toString() + ".json"
    let ipath = join(DBPATH, fileData)//"DATA/"data.json");

    try {
        let dataArray = [];

        // Leer y parsear el archivo existente
        if (existsSync(ipath)) 
        {
            try {
                const fileContent = readFileSync(ipath, 'utf8');
                
                if (fileContent.trim() !== '') {
                    dataArray = JSON.parse(fileContent);
                    // Asegurarse de que sea un array
                    if (!Array.isArray(dataArray)) {
                        dataArray = [];
                    }
                }
                //dataArray.push(newObject);
                dataArray.push(newObj);

                // Escribir de vuelta al archivo
                writeFileSync(ipath, JSON.stringify(dataArray, null, 2), 'utf8');
                //
                //writeIndex(collection, "EMAIL", newObj.email, centena, nusers)
                //SE EVIA EL EMAIL PARA DETECTAR...
                //LAS DOS LETRAS PARA EL IDEX...
                writeIndex(collection, "EMAIL", newObj.email, newObj)

                //PORCADA PALARA CLAVE?
                //writeIndex(collection, field, newObj.email, centena, ID)
                //
                return { 
                    success: true, 
                    //action: existingIndex !== -1 ? 'updated' : 'created',
                    //data: newObject            
                    data: newObj
                }

            } catch (parseError) {
                console.warn('Error parsing JSON file, starting with empty array:', parseError)
                dataArray = []
                return { success: false, error: 'Error interno, array vacío' }
            }
        } 
        else{
            try {
                console.log("no EXISTE IPATH")
                dataArray = [];
                dataArray.push(newObj);
                writeFileSync(ipath, JSON.stringify(dataArray, null, 2), 'utf8');

            } catch (parseError) {
                console.warn('Error parsing JSON file, starting with empty array:', parseError)
                dataArray = []                
                return { success: false, error: 'Error interno, array vacío' }
            }
        }      

    } catch (error) {
        console.error('Error:', error);
        return { success: false, error: 'Error interno del servidor' };
    }
}