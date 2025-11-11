import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
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
    let filename =  "D" + "100" + ".json"
    let filepath = DBPATH + collection + "/" + filename
       
    //LEERDATAFILE(){   //TECH FUNCIONES INTRINCECAS
    let offers = JSON.parse(readFileSync(filepath, 'utf8'))

    for (let u in offers)
    {            
      content.push({id:offers[u].ole, name:offers[u].fname, offer:offers[u].offer,  email:offers[u].email})
    }
    return content
}

//Sólo llamar en cambio de nElemsPerPages
function preparePaginationDB(collection)
{
    //NUMERO DE DOCUMENTOS POR CADA CENTENA:
    let filename =  "INFOCENTENAS.json";
    let filepath = DBPATH + collection +"/INFO/" + filename;
    let infoCentenas = JSON.parse(readFileSync(filepath, 'utf8'));
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
    let saltear = 0    
    let start_in = page*nOffersPage - nOffersPage + 1 
    let centena = obtenerCentena(start_in)
    saltear = (start_in - (centena-100)) - 1;//9;//EN EL QUE EMPIEZA LA PAGINA    
    let str_centena =    centena.toString()
    let filename =       "D" + str_centena + ".json";
    let filepath =       DBPATH + collection + "/" + filename;
    // console.log("PER",filepath)
    let offers = JSON.parse("{}");
    let count_offers = 0
        
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
    //console.log("the id",id)
    let centena = obtenerCentena(id)
    let fileData = collection + "/D" + centena.toString() + ".json"
    let ipath = join(DBPATH, fileData)//"DATA/"data.json");
    //console.log(ipath) 
    let offers = [{}]
    if (existsSync(ipath)) 
        offers = JSON.parse(readFileSync(ipath, 'utf8'));

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

    let valorBuscado = "";
    let valorElemento = "";
    let esExacto = true;
    let esParecido = true;
        
    array.forEach(elemento => {
        
        for (const clave in criterios) {

            valorBuscado = criterios[clave];
            valorElemento = elemento[clave];
            
            if (valorElemento === undefined){
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
            if (esExacto && incluirExactos) 
                resultados.exactos.push(elemento);
            if (esParecido && incluirParecidos && resultados.parecidos.length < limiteParecidos) 
                resultados.parecidos.push(elemento);        
        }        
    });
    return resultados;
}

//=====================================================================

export function searchInDB2(collection, criterios)
{
    let two_letters = "";
    let cap_field = "";
    let ruta = "";
    let valorBuscado = "";

    let content = []
    let objs = []

    let exactosCombinados = [];
    let parecidosCombinados = [];
    
    let busq = []

    for (const clave in criterios) {

        valorBuscado = criterios[clave];
        //const valorElemento = elemento[clave];
        //ver archivo índice
        two_letters = aMayusculasSinAcentos( valorBuscado.slice(0,2) );//( value.slice(0,2) );
        cap_field = aMayusculasSinAcentos( clave )//( field )
        ruta = DBPATH + collection + "/INDEX/" + cap_field +"/"+ two_letters + ".json";
    
        if (!existsSync(ruta)) 
        {
            console.log("SEARCHINDB no existe la ruta")
            return content
        }
        
        objs = JSON.parse(readFileSync(ruta, 'utf8'));
            
        busq = buscarInteli(objs, { [clave]: valorBuscado });//{ [field]: value });
        exactosCombinados = [...exactosCombinados, ...busq.exactos];
        parecidosCombinados = [...parecidosCombinados, ...busq.parecidos];
    }        

    let procontent = [...exactosCombinados, ...parecidosCombinados];
    
    busq = buscarInteli(procontent, criterios);
    exactosCombinados = [...exactosCombinados, ...busq.exactos];    
    parecidosCombinados = [...parecidosCombinados, ...busq.parecidos];
        
    content = [...exactosCombinados, ...parecidosCombinados];
    return content ;//    
}

//=====================================================================

export function searchInDB (collection, field, value)
{
    const two_letters = aMayusculasSinAcentos( value.slice(0,2) );
    const cap_field = aMayusculasSinAcentos( field )
    const ruta = DBPATH + collection + "/INDEX/" + cap_field +"/"+ two_letters + ".json";
    
    //AGREGAR N
    console.log ("GGGGGGfield",field,"GGGGGGfield",value)

    let content = []

    if (!existsSync(ruta)) 
    {
        console.log("SEARCHINDB no existe la ruta")
        return content
    }
    
    const objs = JSON.parse(readFileSync(ruta, 'utf8'));
        
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

    

export function updateDB(collection, user_id,{name,offer,espe,extra})//,timestamp})
{
    const centena = obtenerCentena(user_id)
    //console.log("CENTENA",centena)
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
        extra: "",
        //timestamp: new Date().toISOString(),
        updatedAt: new Date().toISOString() // Campo adicional para tracking
    };
    
    newObject.ole = user_id
    newObject.name = name
    newObject.espe = espe
    
   ////Eliminar los índices anteriores
    //writeIndex(collection, "NAME", newObj.email, newObj)
    //for (let clave in criterio) {
    //    if (criterio[clave]) { // Solo copia si el valor es "verdadero" (no vacío, no null, no undefined)
    //        crts[clave] = criterio[clave];
    //    }
    // }


    newObject.offer = offer
    newObject.extra = extra
    //newObject.timestamp = timestamp

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
            data_objs = JSON.parse(fileContent);
        } catch (parseError) {
            console.warn('Error parsing JSON file, starting with empty array:', parseError);
        }
    }
    else{
        const dir = dirname(ipath);
        if(!existsSync(dir))    // Crear el directorio si no existe
            mkdirSync(dir, { recursive: true });
    }
    data_objs.push(obj)    
    writeFileSync(ipath, JSON.stringify(data_objs, null, 2), 'utf8');
}

//=============================================================

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
                //console.log("PORRRQUEEEE",dataArray,newObj)
                writeFileSync(ipath, JSON.stringify(dataArray, null, 2), 'utf8');
                //console.log("====addDocumentDB newObj.email===",  newObj.email)
                writeIndex(collection, "EMAIL", newObj.email, newObj)
                return { 
                    success: true,
                    data: newObj
                }
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