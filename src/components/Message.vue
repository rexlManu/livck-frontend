<template>
  <div>
    <CirclePoint v-bind:type="type" v-bind:mini="false" />
    <p class="text-muted para-desc mx-auto mt-4 mt-2 text-center">
      {{ message }}
    </p>
  </div>
</template>

<script>
import CirclePoint from "./CirclePoint";
export default {
  props: ["message", "type"],
  components: {
    CirclePoint,
  },
};
</script>
