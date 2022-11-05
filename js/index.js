var fecha=' '
apiClima='https://api.open-meteo.com/v1/forecast?latitude=-54.8019&longitude=-68.303&hourly=temperature_2m,apparent_temperature,precipitation,showers,windspeed_10m&timezone=America%2FSao_Paulo'

dayjs.locale('es')

const evaluaLluvia=(lluvia)=>{
    if (lluvia<2) {
        return `Lluvias leves`
    }else if (lluvia>=2 && lluvia<15){
        return `Lluvia`
    }else if (lluvia>=15 && lluvia<30 ) {
        return `Lluvias fuertes`
    }else if(lluvia>=30 && lluvia<60){
        return `Lluvias muy fuertes`
    }else{
        return `Lluvias torrenciales`
    }
}

const tarjeta =(temperatura, tiempo, sensacionTermica,precipitacion, lluvia, viento, unidades)=>{
    // inicializa variable
    let html_tarjeta=` `

    // Si el día (sin la hora), es distinto al que se recibe por parámetro () entonces se crea un encabezado para la fecha
    if ( dayjs(tiempo).format('YYYYMMDD')!=dayjs(fecha).format('YYYYMMDD') ){
        fecha=tiempo
        let fechaFormateada=dayjs(tiempo).format('dddd DD')+' de '+dayjs(tiempo).format('MMMM')
        html_tarjeta+=`<div class="col-sm-12"><h2>${fechaFormateada}</h2></div>`
    }

    // estilos para la tarjeta
    html_tarjeta+= `
    <div class="col-sm-4 col-lg-2 card">
        <div class="card-body">
            <h5 class="card-title">${dayjs(tiempo).format('HH:mm')}</h5>
            <h6>Temperatura: ${temperatura}${unidades.temperature_2m}</h6> 
            <h6>Sens. térmica: ${sensacionTermica}${unidades.apparent_temperature} </h6>
            <h6>${evaluaLluvia(lluvia) }</h6>
            <h6>Viento: ${viento}${unidades.windspeed_10m} </h6>
        </div>
    </div>
    `
                // <h6>Precipitaciones: ${precipitacion}${unidades.precipitation}</h6>
                // <h6>Lluvias: ${lluvia}${unidades.showers}</h6>
    return html_tarjeta
}

const generaPlantilla= (datosHora, unidades)=>{
    /*
      Se inicializa el arreglo con [] (en la línea 61 ).
      Cada vez que la hora indicada coincida con la hora del elemento, se introduce la posición (index) en el arreglo.
      Al finalizar se retorna el arreglo con los índices.
    */
    let indices = datosHora.time.reduce((arreglo,hora,index)=>{
        // Si es el dato de la última hora o si se corresponde con las horas previstas, guardará los índices
        if (dayjs(hora).format("YYYYMMDDHH").includes(dayjs().format("YYYYMMDDHH"))||hora.includes("T04:00")|| hora.includes("T08:00")|| hora.includes("T12:00")||hora.includes("T16:00")||hora.includes("T20:00")||hora.includes("T00:00")) {
        // if (hora.includes("T06:00")|| hora.includes("T12:00")|| hora.includes("T18:00")||hora.includes("T00:00")) {
            arreglo.push(index)
        }
        return arreglo
    },[])
    // inicializa la plantilla para crear el row
    let plantilla = `<div class="row">`

    /* se crea la card para una temperatura en una hora dada, recorriendo cada índice. 
        Se envía el elemento del clima que está contenido en el índice que corresponde y las unidades
    */
    indices.forEach(i=>{
        // si la hora del dato del clima es mayor al momento actual, crea la tarjeta
        if (parseInt(dayjs(datosHora.time[i]).format('YYYYMMDDHH')) >= parseInt(dayjs().format('YYYYMMDDHH')) ) {
            // console.log( parseInt(dayjs(datosHora.time[i]).format('YYYYMMDDHH'))+4 );
            // dayjs(datosHora.time[i]).format('YYYYMMDDHH')+4
            plantilla +=tarjeta(datosHora.temperature_2m[i],datosHora.time[i],datosHora.apparent_temperature[i],datosHora.precipitation[i],datosHora.showers[i],datosHora.windspeed_10m[i],unidades)
        }
    });

    // cierra la plantilla
    plantilla+=`</div>`
    return plantilla
}

// Fetch
fetch(apiClima)
.then(response => response.json())
.then(data => {
    clima.innerHTML=generaPlantilla(data.hourly,data.hourly_units)
}).catch((error) => {
    console.error('Error:', error);
})