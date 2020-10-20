<template>
  <div>
    <div
      class="box"
      v-bind:class="{
        box: !mini,
        'box-mini': !!mini,
        'box-online': type == 'online',
        'box-half': type == 'partly',
        'box-offline': type == 'offline',
      }"
    >
      <div
        v-bind:class="{
          pulsator: !mini,
          'pulsator-mini': !!mini,
          'pulsator-online': type == 'online',
          'pulsator-half': type == 'partly',
          'pulsator-offline': type == 'offline',
        }"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["type", "mini"],
};
</script>
