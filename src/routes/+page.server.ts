import type { PageServerLoad, Actions } from './$types';
import { fail } from '@sveltejs/kit';
import { promises as fs } from 'fs';
import path from 'path';

// La ruta del archivo .json
const dataDir = path.resolve('data');
const filePath = path.join(dataDir, 'farmacos.json');

// Metodo que asegura si el directorio y el archivo existen
async function ensureFileExists() {
    try {
        // En caso de no existir se crean ambos 
        await fs.mkdir(dataDir, { recursive: true });

        try {
            await fs.access(filePath);
        } catch {
            await fs.writeFile(filePath, JSON.stringify([], null, 2), 'utf-8');
        }
    } catch (error) {
        console.error('Error al asegurar que el archivo exista:', error);
        throw new Error('No se pudo inicializar el almacenamiento de datos');
    }
}

// Metodo auxiliar para leer los datos del archivo JSON
async function readFarmacos() {
    await ensureFileExists(); // Se encerga de asegurar de que el archivo exista antes de leer
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error: any) {
        console.error('Error al leer el archivo JSON:', error);
        return [];
    }
}

// Metodo que sirve como auxiliar para escribir datos en el archivo JSON
async function writeFarmacos(farmacos: any[]) {
    try {
        await fs.writeFile(filePath, JSON.stringify(farmacos, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error al escribir en el archivo JSON:', error);
        throw new Error('No se pudo guardar los datos');
    }
}

export const load: PageServerLoad = async () => {
    const farmacos = await readFarmacos();
    return {
        farmacos
    };
};

export const actions: Actions = {
    // Para crear un nuevo medicamento
    create: async ({ request }) => {
        const data = await request.formData();
        const nombre = data.get('nombre')?.toString();
        const descripcion = data.get('descripcion')?.toString();
        const precio = parseFloat(data.get('precio')?.toString() || '0');

        if (!nombre || !descripcion || isNaN(precio)) {
            return fail(400, { error: 'Todos los campos son obligatorios y el precio debe ser válido' });
        }

        const farmacos = await readFarmacos();
        const nuevoFarmaco = {
            id: farmacos.length ? Math.max(...farmacos.map((f: any) => f.id)) + 1 : 1,
            nombre,
            descripcion,
            precio
        };
        farmacos.push(nuevoFarmaco);
        await writeFarmacos(farmacos);

        return { success: true, message: 'Medicamento creado con éxito' };
    },

    // Se actualiza un medicamento existente
    update: async ({ request }) => {
        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');
        const nombre = data.get('nombre')?.toString();
        const descripcion = data.get('descripcion')?.toString();
        const precio = parseFloat(data.get('precio')?.toString() || '0');

        const farmacos = await readFarmacos();
        const farmaco = farmacos.find((f: any) => f.id === id);
        if (!farmaco) {
            return fail(404, { error: 'No se ha encontrado el medicamento' });
        }

        if (!nombre || !descripcion || isNaN(precio)) {
            return fail(400, { error: 'Todos los campos son obligatorios y el precio debe ser válido' });
        }

        farmaco.nombre = nombre;
        farmaco.descripcion = descripcion;
        farmaco.precio = precio;

        await writeFarmacos(farmacos);
        return { success: true, message: 'Medicamento actualizado con éxito' };
    },

    // Se machetea(Elimina) un medicamento
    delete: async ({ request }) => {
        const data = await request.formData();
        const id = parseInt(data.get('id')?.toString() || '0');

        const farmacos = await readFarmacos();
        const index = farmacos.findIndex((f: any) => f.id === id);
        if (index === -1) {
            return fail(404, { error: 'Medicamento no encontrado' });
        }

        farmacos.splice(index, 1);
        await writeFarmacos(farmacos);
        return { success: true, message: 'Medicamento eliminado con éxito' };
    }
};