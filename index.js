require('dotenv').config();
const { leerInput, inquirerMenu, pausa, listadoLugares } = require("./helpers/inquirer");
const Busquedas = require("./models/busquedas");

const main = async() => {

    let opt;
    const busquedas = new Busquedas();
    do {
        //imprime el menu 
        opt = await inquirerMenu();

        switch (opt) {

            case 1:
                // Buscar ciudad
                const termino = await leerInput('Ciudad: ');
                const lugares = await busquedas.ciudad(termino);
                const id = await listadoLugares(lugares);
                if (id === '0') continue;


                const lugarSele = lugares.find(lug => lug.id === id);
                //Guardar DB 
                busquedas.agregarHistorial(lugarSele.name);

                //clima 
                const clima = await busquedas.climaLugar(lugarSele.lat, lugarSele.lng);
                //mostrar resultados 
                console.clear();
                console.log('\nInformación de la ciudad\n'.green);
                console.log('Ciudad:', lugarSele.name.green);
                console.log('Lat:', lugarSele.lat);
                console.log('Lng:', lugarSele.lng);
                console.log('Tempuratura:', clima.temp);
                console.log('Miníma:', clima.min);
                console.log('Maxima', clima.max);
                console.log('Como está el clima:', clima.desc.green);

                break;
            case 2:
                // Historia
                busquedas.historialCapitalizado.forEach((lugar, i) => {
                    const idx = `${ i + 1 }.`.green;
                    console.log(`${ idx } ${ lugar }`)

                });


                break;
        }


        if (opt !== 0) await pausa();
    } while (opt !== 0);



}

main();