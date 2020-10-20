<template>
  <div id="app">
    <section
      class="bg-half-170 pb-0 d-table h-25 w-100"
      style="background-color: #7289DA"
    >
      <div class="container">
        <div class="row justify-content-center">
          <div class="col-lg-10">
            <div class="title-heading text-center mt-1">
              <h1
                class="heading mb-3 text-white"
                style="font-size: 30px"
              >LIVCK.com</h1>
              <h6 class="mb-3 text-white">
                Nächstes Update in <span>{{ this.seconds }}</span> Sekunden
              </h6>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="position-relative">
      <div class="shape overflow-hidden" style="color: #2C2F33">
        <svg
          viewBox="0 0 2880 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 48H1437.5H2880V0H2160C1442.5 52 720 0 720 0H0V48Z"
            fill="currentColor"
          ></path>
        </svg>
      </div>
    </div>

    <section class="section">
      <div class="container">
        <div class="row">
          <div
            class="col"
            style="border: none;color: white;margin-top: -25px;margin-bottom: 35px"
          >
            <Message
              v-if="!this.loading"
              v-bind:message="this.message.message"
              v-bind:type="this.message.type"
            />
          </div>
        </div>

        <div class="row justify-content-center">
          <div class="col-12 col-md-8 text-center">
            <div class="section-title mb-4 pb-2">
              <div class="sk-flow" style="margin: 0 auto" v-if="this.loading">
                <div
                  class="sk-flow-dot"
                  style="border-radius: 25px;border-color:#FFF;"
                ></div>
                <div class="sk-flow-dot"></div>
                <div class="sk-flow-dot"></div>
              </div>

              <div v-if="!this.loading">
                <div
                  v-for="category in this.categories"
                  v-bind:key="category.id"
                >
                  <div v-if="getMonitorsByCategory(category).length != 0">
                    <h4
                      class="title mb-1 text-left text-white"
                      style="font-size: 18px;float: left; color: black"
                    >
                      {{ category.name }}
                    </h4>
                    <div
                      v-for="monitor in getMonitorsByCategory(category)"
                      v-bind:key="monitor.id"
                    >
                      <table
                        class="table table-padded"
                        style="min-height: 66px;"
                      >
                        <tbody>
                          <tr
                            style="display: flex!important;width: 100%;"
                            class="mb-2"
                          >
                            <td
                              class="AVAILABLE"
                              style="text-align: left;width: 100%"
                            >
                              <span>{{ monitor.name }}</span>
                            </td>
                            <td
                              class="text-right text-muted"
                              style="width: 100%;padding-right: 0px"
                            >
                              <!--<span></span>
                            <a style="padding: 0px 0px 0px 10px">—</a>-->
                            </td>
                            <td class="text-center">
                              <CirclePoint
                                v-bind:type="
                                  monitor.state == 'AVAILABLE'
                                    ? 'online'
                                    : 'offline'
                                "
                                v-bind:mini="true"
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="row justify-content-center" v-if="!this.loading">
          <div class="col-12 col-md-8 text-center">
            <div class="card border-0 rounded mb-2">
              <a v-if="this.alerts.length == 0"
                ><div class="card-header border-0 bg-light p-3 pr-5">
                  <div class="row">
                    <h6
                      class="col title mb-0 text-center"
                      style="font-size: 16px"
                    >
                      Keine Vorfälle vorhanden.
                    </h6>
                  </div>
                </div>
              </a>

              <div v-for="alert in this.alerts" v-bind:key="alert.id">
                <div class="section-title mb-5">
                  <h4
                    class="title text-left"
                    style="font-size: 18px;float: left"
                  >
                    Aktuelles
                  </h4>
                </div>
                <div class="faq-content"><div class="accordion"></div></div>
                <Alert v-bind:alert="alert" />
              </div>
            </div>
          </div>
        </div>

        <div
          class="text-white"
          style="vertical-align: bottom;margin-top: 45px;"
          v-if="!this.loading"
        >
          <div class="row text-center">
            <div class="col-3 col-sm-2"></div>
            <div class="col-3 col-sm-4" style="text-align: start;">
              <div class="input-group input-group-sm mb-3" style="width: 15em">
                <div
                  class="input-group-prepend"
                  data-toggle="tooltip"
                  style="word-break: break-all;text-align: left;max-width: none;"
                  data-title="TEST"
                  data-html="true"
                >
                  <span class="input-group-text" id="basic-addon1">@</span>
                </div>
                <input
                  class="form-control form-control-sm"
                  type="email"
                  v-model="email"
                  autocomplete="off"
                  placeholder="E-Mail"
                  style="width: 18em;"
                />
                <div class="input-group-append">
                  <button @click="subscribe" class="btn btn-primary">
                    <i class="fa fa-arrow-right"></i>
                  </button>
                </div>
              </div>
            </div>
            <div class="col-3 col-sm-4" style="text-align: end;">
              Powered by
              <a style="color: #13dba4" href="https://LIVCK.com" target="_blank"
                >LIVCK</a
              >
            </div>
            <div class="col-3 col-sm-2"></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import Message from "./components/Message";
import Alert from "./components/Alert";
import CirclePoint from "./components/CirclePoint";

export default {
  name: "App",
  components: {
    Message,
    CirclePoint,
    Alert,
  },
  data() {
    return {
      loading: true,
      subscripted: false,
      email: "",
      seconds: 60,
      message: {
        type: "online",
        message: "ich bims 1 rene!",
      },
      categories: [],
      monitors: [],
      alerts: [],
    };
  },
  created() {
    var self = this;
    setInterval(() => {
      if (self.seconds == 0) {
        self.loadData();
        self.seconds = 61;
      }
      self.seconds--;
    }, 1000);
    this.loadData();
  },
  methods: {
    getMonitorsByCategory(category) {
      return this.monitors.filter(
        (monitor) => monitor.monitor_category_id == category.id
      );
    },
    loadData() {
      Promise.all(
        fetch("/api/v1/categories")
          .then((r) => r.json())
          .then((json) => {
            this.categories = json.data;
          }),
        fetch("/api/v1/monitors")
          .then((r) => r.json())
          .then((json) => {
            this.monitors = json.data;
          }),
        fetch("/api/v1/alerts")
          .then((r) => r.json())
          .then((json) => {
            this.alerts = json.data;
          })
      ).then(() => {
        this.loading = false;
        this.updateMessage();
      });
    },
    updateMessage() {
      if (
        this.monitors.filter((monitor) => monitor.state == "AVAILABLE").length >
        0
      ) {
        this.message.type = "partly";
        this.message.message =
          "Einige Dienste sind zurzeit nur beschränkt erreichbar 😳";
      } else if (
        this.monitors.filter((monitor) => monitor.state == "AVAILABLE")
          .length == this.monitors.length
      ) {
        this.message.type = "offline";
        this.message.message =
          "Aktuelle Dienste sind zurzeit nicht erreichbar 😵";
      } else {
        this.message.type = "online";
        this.message.message = "Alle Systeme laufen einwandfrei 🙂";
      }
    },
    subscribe() {
      // api/v1/newsletter
      fetch("/api/v1/newsletter", {
        method: "post",
        data: {
          email: this.email,
        },
      })
        .then((response) => response.json())
        .then((response) => {
          window.toastr.success(response.messages.success[0]);
          this.subscripted = true;
          this.email = "";
        })
        .catch((e) => {
          window.toastr.error(e.json().messages.error[0]);
        });
    },
  },
};
</script>

<style scoped>
.table.table-padded tbody td:first-child {
  border-radius: 4px 0px 0px 4px;
}
.table.table-padded tbody td {
  padding: 0.9rem 1.1rem;
  border: none;
  border-right: 1px solid rgba(0, 0, 0, 0.03);
}

.blockquote {
  border-radius: 6px;
  font-size: 16px;
}
blockquote pre {
}
</style>
