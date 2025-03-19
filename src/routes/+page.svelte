<script lang="ts">
    import type { PageData } from "./$types";
    import type { ActionData } from "./$types";

    export let data: PageData;
    export let form: ActionData;

    let editFarmaco: {
        id: number;
        nombre: string;
        descripcion: string;
        precio: number;
    } | null = null;
</script>

<div class="container">
    <h1>FARMAMERCA 🧪</h1>

    <!-- Mensaje para saber si hay un error o si la informacion fue enviada correctamente -->
    {#if form?.message}
        <div
            class="alert"
            class:success={form.success}
            class:error={!form.success}
        >
            {form.message}
        </div>
    {/if}

    <!-- Formulario para crear un nuevo producto -->
    <section class="card">
        <h2>Agregar Medicamento</h2>
        <form method="POST" action="?/create">
            <div class="form-group">
                <input
                    type="text"
                    name="nombre"
                    placeholder="Nombre"
                    required
                />
            </div>
            <div class="form-group">
                <input
                    type="text"
                    name="descripcion"
                    placeholder="Descripción"
                    required
                />
            </div>
            <div class="form-group">
                <input
                    type="number"
                    name="precio"
                    placeholder="Precio"
                    step="0.01"
                    required
                />
            </div>
            <button type="submit" class="btn btn-primary">Agregar</button>
        </form>
    </section>

    <!-- Listado de Medicinas  -->
    <section class="card">
        <h2>Lista de Medicamentos</h2>
        {#if data.farmacos.length === 0}
            <p>No hay fármacos registrados.</p>
        {:else}
            <div class="farmaco-list">
                {#each data.farmacos as farmaco}
                    <div class="farmaco-item">
                        <div class="farmaco-info">
                            <strong>{farmaco.nombre}</strong> - {farmaco.descripcion}
                            - <strong>{farmaco.precio.toFixed(2)}$</strong>
                        </div>
                        <div class="farmaco-actions">
                            <button
                                class="btn btn-secondary"
                                on:click={() => (editFarmaco = farmaco)}
                                >Editar</button
                            >
                            <form method="POST" action="?/delete">
                                <input
                                    type="hidden"
                                    name="id"
                                    value={farmaco.id}
                                />
                                <button type="submit" class="btn btn-danger"
                                    >Eliminar</button
                                >
                            </form>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    </section>

    <!-- Formulario para editar el medicamento -->
    {#if editFarmaco}
        <section class="card">
            <h2>Editar Medicamento</h2>
            <form method="POST" action="?/update">
                <input type="hidden" name="id" value={editFarmaco.id} />
                <div class="form-group">
                    <input
                        type="text"
                        name="nombre"
                        value={editFarmaco.nombre}
                        required
                    />
                </div>
                <div class="form-group">
                    <input
                        type="text"
                        name="descripcion"
                        value={editFarmaco.descripcion}
                        required
                    />
                </div>
                <div class="form-group">
                    <input
                        type="number"
                        name="precio"
                        value={editFarmaco.precio}
                        step="0.01"
                        required
                    />
                </div>
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary"
                        >Guardar</button
                    >
                    <button
                        type="button"
                        class="btn btn-secondary"
                        on:click={() => (editFarmaco = null)}
                    >
                        Cancelar
                    </button>
                </div>
            </form>
        </section>
    {/if}
</div>
