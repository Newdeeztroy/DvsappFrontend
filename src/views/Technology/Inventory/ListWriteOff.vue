<template>
<!-- Tabla -->
    <div class="table-responsive">
        <table class="table table-hover table-bordered align-middle compact-table" id="inventories-table">
                <thead class="table-header">
                    <tr>
                        <th @click="sortTable('#')">#</th>
                        <th @click="sortTable('article_name')">Tipo de Dispositivo</th>
                        <th @click="sortTable('brand')">Marca</th>
                        <th @click="sortTable('part_number')">Número de Parte</th>
                        <th @click="sortTable('serial')">Serial</th>
                        <th @click="sortTable('invoice_checked')">Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
        </table>
    </div>

</template>

<script>

</script>