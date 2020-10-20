<template>
  <div>
    <div class="card border-0 rounded mb-2">
      <a @click="hide = !hide"
        ><div class="card-header border-0 bg-light p-3 pr-5">
          <div class="row">
            <h6 class="col title mb-0 text-left" style="font-size: 16px">
              {{ alert.title }}
            </h6>
            <h6 class="col title mb-0 text-right ml-auto">
              {{ alert.created_at | formatDate }}
            </h6>
          </div>
        </div>
      </a>
      <div class="text-left" v-if="!this.hide">
        <div class="card-body px-2 py-4">
          <blockquote class="blockquote p-3 mb-0">
            <p
              class="text-muted mb-0 faq-ans"
              style="word-break: normal!important;"
              v-html="alert.message "
            >
            </p>
          </blockquote>
        </div>
        <div
          class="px-2"
          style="text-align: right;padding-bottom: 0.3em;margin-top: -1em;"
        >
          <a
            target="_blank"
            class="badge badge-primary mb-1"
            style="text-align: right!important;cursor: pointer"
            >Teilen</a
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["alert"],
  data() {
    return {
      hide: true,
    };
  },
};
</script>
