<template>
  <div class="full-width column items-center q-pa-lg">
    <div class="column items-center q-pa-lg full-width relative-position overflow-hidden bg-abs">
      <div class="absolute-full half-transparent"></div>
      <MovingColorsBackground/>
      <q-img style="width: 280px;"
             src="/images/logo_transparent.png"
             spinner-color="white"
      />
      <div class="text-h3 relative-position">BrianTrainer</div>
      <div class="column q-mt-xl">
        <q-btn color="secondary" rounded size="xl" icon="double_arrow">Jetzt trainieren</q-btn>
      </div>
    </div>

    <div class="max-width-sm column items-center relative-position">
      <div class="row max-width-sm justify-center items-center q-my-xl relative-position q-pa-md">
        <div class="col-4">
          <q-card class="shadow-0">
            <img src="/images/promo/promo5.png"/>
          </q-card>
        </div>
        <div class="col-8 text-center">
          <div class="text-h4 ">Was bringt gehirn jogging</div>
          blasdflk sdflkjasdg laksdjg
         </div>
      </div>
    </div>

    <div class="full-width column items-center relative-position overflow-hidden bg-abs ">
      <div class="absolute-full half-transparent"></div>
      <MovingColorsBackground/>
      <div class="row max-width-sm justify-center items-center q-px-lg q-py-md relative-position">
        <div class="col-8 text-center">
          <div class="text-h4">Was bringt gehirn jogging</div>
          blasdflk sdflkjasdg laksdjg
        </div>
        <div class="col-4">
          <q-card class="shadow-0">
            <img src="/images/promo/promo4.png"/>
          </q-card>
        </div>
      </div>
    </div>

    <div class="max-width-sm column items-center relative-position">
      <div class="row max-width-sm justify-center items-center q-pa-md q-my-xl">
        <div class="col-4">
          <q-card class="shadow-0">
            <img src="/images/promo/promo3.png"/>
          </q-card>
        </div>
        <div class="col-8 text-center">
          <div class="text-h4">Was bringt gehirn jogging</div>
          blasdflk sdflkjasdg laksdjg
        </div>
      </div>

      <div class="column q-mt-xl q-py-xl q-px-md bg-abs overflow-hidden relative-position full-width bg-primary">
        <MovingColorsBackground/>
        <div class="text-h3 text-center">Millions of users</div>
        <div class="text-h6 text-center">Years of experience</div>
        <div class="text-center">
          <q-rating
            size="3.5em"
            class="no-pointer-events"
            color="yellow-12"
            icon="star"
          />
        </div>

        <div class="row justify-center q-col-gutter-lg q-mt-xl">
          <div class="col-6">
            <q-card>
              <q-card-section>
                adlkasdgjsadlkg jasdglkasjg
                asdgasdglakj sadgsadg sag
                asdlgkasjgd adg
                asdgas
                <div class="q-mt-md text-right">
                  <q-chip size="lg">
                    <q-avatar>
                      <img src="https://cdn.quasar.dev/img/avatar1.jpg">
                    </q-avatar>
                    Alice
                  </q-chip>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="col-6">
            <q-card>
              <q-card-section>
                adlkasdgjsadlkg jasdglkasjg
                asdgasdglakj sadgsadg sag
                asdlgkasjgd adg
                asdgas
                <div class="q-mt-md text-right">
                  <q-chip size="lg">
                    <q-avatar>
                      <img src="https://cdn.quasar.dev/img/avatar2.jpg">
                    </q-avatar>
                    John
                  </q-chip>
                </div>
              </q-card-section>
            </q-card>
          </div>
        </div>
      </div>

      <div class="column q-mt-md">
        <q-btn color="primary" rounded size="xl" icon="double_arrow" class="q-mb-lg">Jetzt trainieren</q-btn>
        <q-btn color="accent" rounded size="xl" icon="menu_book">Anleitung</q-btn>
      </div>
    </div>
  </div>
  <div class="full-width column items-center q-pa-lg bg-primary">
    <div class="max-width-sm row justify-between full-width text-center text-white">
      <q-btn flat no-caps class="col-3" @click="showLegalNotice">Privacy</q-btn>
      <q-btn flat no-caps class="col-3" @click="showLegalNotice">Terms of service</q-btn>
      <q-btn flat no-caps class="col-3" @click="showLegalNotice">Cookies</q-btn>
      <q-btn flat no-caps class="col-3" @click="showLegalNotice">Legal notice</q-btn>
    </div>
  </div>
</template>


<script setup lang="ts">
  import {useQuasar} from "quasar";
  import MovingColorsBackground from 'src/components/backgrounds/MovingColorsBackground.vue'
  import MovingStarsBackground from 'src/components/backgrounds/MovingStarsBackground.vue'

  const $q = useQuasar()

  function showLegalNotice () {
    $q.dialog({
      message: 'Some imporant legal information',
      ok: 'X',
      persistent: true,
    });
  }

</script>

<style scoped lang="scss">
  .gradient {
    background-image: linear-gradient(to bottom right, #FFFFAA55, #AAFFFF55);
  }
  .body--dark .gradient {
    background-image: none;
  }

  .half-transparent {
    opacity: 0.5;
    background-color: var(--q-primary);
  }
</style>
