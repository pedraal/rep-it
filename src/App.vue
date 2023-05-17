<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import { useClipboard, useIntervalFn, useUrlSearchParams } from '@vueuse/core'
import { useHead } from '@unhead/vue'

import Input from './components/Input.vue'
import Checkbox from './components/Checkbox.vue'
import Button from './components/Button.vue'

useHead({
  title: 'RepIt',
  script: [
    {
      'src': 'https://plausible.pedraal.fr/js/plausible.js',
      'defer': true,
      'data-domain': window.location?.host,
    },
  ],
  link: [
    {
      rel: 'icon',
      type: 'image/svg+xml',
      href: '/vite.svg',
    },
  ],
  meta: [
    { charset: 'utf-8' },
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    {
      name: 'description',
      content: 'Planifiez, partagez et réalisez vos séances de HIIT',
    },
  ],
})

const repetitions = ref(3)
const duration = ref(30)
const rest = ref(15)
const newExercice = ref('')
const showExerciceIndex = ref(false)
const chromakeyMode = ref(false)
const chromakeyBgColor = ref('#38bef8')
const chromakeyTextColor = ref('#ffffff')
const sound = ref(true)
const startWithRest = ref(false)

const audio = new Audio('/bell.mp3')
function playSound() {
  if (!sound.value)
    return
  audio.currentTime = 0
  audio.play()
}

const exercices = ref<string[]>([
  'Jumping jacks',
  'Fentes avant',
  'Burpees',
  'Hip thrust',
  'V up',
  'Moutain climbers',
  'Tirages dos',
  'Planche',
])
const currentExercice = ref(0)
const currentRepetition = ref(1)
const isResting = ref(false)
const finished = ref(false)
const stopped = ref(true)

function addExercice() {
  if (!newExercice.value)
    return
  exercices.value.push(newExercice.value)
  newExercice.value = ''
}

function removeExercice(index: number) {
  exercices.value.splice(index, 1)
}

const timer = ref(0)
const globalTimer = ref(0)
const { pause, resume, isActive } = useIntervalFn(() => {
  timer.value += 1
  globalTimer.value += 1
  if (isResting.value && (timer.value % (rest.value * 100) === 0)) {
    isResting.value = false
    timer.value = 0
    playSound()
  }
  else if (timer.value % (duration.value * 100) === 0) {
    isResting.value = true
    currentExercice.value += 1
    timer.value = 0
    playSound()
  }

  if (currentExercice.value === exercices.value.length) {
    currentExercice.value = 0
    currentRepetition.value += 1
  }

  if (currentRepetition.value > repetitions.value) {
    stop()
    currentRepetition.value -= 1
    finished.value = true
  }
}, 10, { immediate: false })

function start() {
  if (stopped.value) {
    stopped.value = false
    globalTimer.value = 0
    isResting.value = false
    timer.value = 0
    currentExercice.value = 0
    currentRepetition.value = 1
  }

  if (startWithRest.value)
    isResting.value = true

  finished.value = false
  resume()
}

function stop() {
  pause()
  stopped.value = true
}

const formatedTimer = computed(() => {
  return formatTimer(timer.value)
})

const formatedGlobalTimer = computed(() => {
  return formatTimer(globalTimer.value)
})

const leftPad = (value: number) => value < 10 ? `0${value}` : value
function formatTimer(value: number) {
  const minutes = Math.floor(value / 100 / 60)
  const seconds = Math.floor(value / 100) - minutes * 60
  const centiseconds = value - seconds * 100 - minutes * 6000
  return `${leftPad(minutes)}:${leftPad(seconds)}:${leftPad(centiseconds)}`
}

function exerciceIsRunning(index: number) {
  return !stopped.value && index === currentExercice.value && !isResting.value
}

function exerciceIsResting(index: number) {
  return !stopped.value && index === currentExercice.value && isResting.value
}

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

const params = useUrlSearchParams('history')
const { copy, copied } = useClipboard({ source: location.href })
function share() {
  params.repetitions = repetitions.value.toString()
  params.duration = duration.value.toString()
  params.rest = rest.value.toString()
  params.exercices = exercices.value.join(',')
  nextTick(() => copy(location.href))
}

onMounted(() => {
  if (typeof params.repetitions === 'string')
    repetitions.value = parseInt(params.repetitions)
  if (typeof params.duration === 'string')
    duration.value = parseInt(params.duration)
  if (typeof params.rest === 'string')
    rest.value = parseInt(params.rest)
  if (typeof params.exercices === 'string')
    exercices.value = params.exercices.split(',').filter(e => e !== '')
})
</script>

<template>
  <div min-h-screen w-screen bg-zinc-900 p="x-8 md:x-4 t-4 b-12" font-sans text-white>
    <h1 text-5xl>
      <div i-ic-round-sports-gymnastics inline-block text="3xl lime-400" />
      <span underline="~ lime-400 offset-6">RepIt</span>
    </h1>
    <div mt-6 gap-8 md:flex xl:gap-24>
      <div md:max-w-sm>
        <p text-2xl>
          Paramètres
        </p>
        <form my-4 flex="~ col" gap-4 @submit.prevent>
          <div flex="~ md:col" gap-4>
            <Input v-model="repetitions" name="repetitions" :disabled="isActive" w="1/4 md:full">
              Séries
            </Input>
            <Input v-model="duration" name="duration" :disabled="isActive" w="1/4 md:full">
              Durée
            </Input>
            <Input v-model="rest" name="rest" :disabled="isActive" w="1/4 md:full">
              Repos
            </Input>
          </div>
          <div flex="~ col" gap-4>
            <Input v-model="newExercice" name="exercice" :disabled="isActive" @keyup.enter.prevent="addExercice">
              Exercice
            </Input>
            <div md:w-full>
              <Button :disabled="isActive" w-full @click.prevent="addExercice">
                Ajouter
              </Button>
            </div>
            <div md:w-full>
              <Button :disabled="isActive" w-full @click.prevent="exercices = []">
                Tout supprimer
              </Button>
            </div>
          </div>
          <div flex="~ wrap md:col" gap-4>
            <Checkbox v-model="sound" name="sound">
              Son
            </Checkbox>
            <Checkbox v-model="startWithRest" name="start-with-rest">
              Commencer en repos
            </Checkbox>
            <Checkbox v-model="showExerciceIndex" name="show-exercice-index">
              Afficher les numéros
            </Checkbox>
          </div>
          <div class="hidden" flex="md:~ col" gap-4>
            <Checkbox v-model="chromakeyMode" name="chromakey-mode">
              Mode chromakey
            </Checkbox>
            <Input v-if="chromakeyMode" v-model="chromakeyBgColor" name="chromakey-bg-color" type="color">
              Couleur fond
            </Input>
            <Input v-if="chromakeyMode" v-model="chromakeyTextColor" name="chromakey-text-color" type="color">
              Couleur texte
            </Input>
          </div>
          <Button @click.prevent="share">
            <span v-if="copied">
              Url copiée !
            </span>
            <span v-else>Partager</span>
          </Button>
        </form>
      </div>
      <div flex="~col" grow gap-4 pt-14 md:px-12 :style="{ background: chromakeyMode ? chromakeyBgColor : '', color: chromakeyMode ? chromakeyTextColor : '' }">
        <div flex gap-2>
          <Button :disabled="isActive || !exercices.length" aria-label="Start" @click="start">
            <span i-ic-round-play-arrow inline-block text-2xl />
            <span class="hidden" md:inline-block>{{ stopped ? 'Commencer' : 'Reprendre' }}</span>
          </Button>
          <Button :disabled="!isActive" aria-label="Pause" @click="pause">
            <span i-ic-round-pause inline-block text-2xl />
            <span class="hidden" md:inline-block>Pause</span>
          </Button>
          <Button :disabled="stopped" aria-label="Stop" @click="stop">
            <span i-ic-round-stop inline-block text-2xl />
            <span class="hidden" md:inline-block>Stop</span>
          </Button>
        </div>
        <p font-mono text="4xl md:7xl">
          {{ formatedTimer }}
        </p>
        <p font-mono text="lg md:2xl">
          {{ formatedGlobalTimer }}
        </p>
        <p v-if="exercices.length" text="3xl md:5xl">
          Série n°<span font-mono>{{ currentRepetition }}</span>
        </p>
        <ul>
          <template v-for="(exercice, index) in exercices" :key="`${exercice}`">
            <li relative my-1 flex items-center gap-3 text="xl md:3xl" :class="[exerciceIsRunning(index) && 'text-lime-400', exerciceIsResting(index) && 'text-amber', stopped && 'hover:line-through cursor-pointer']" @click="stopped ? removeExercice(index) : true">
              <div absolute mt-1 h-8 min-h-8 min-w-8 w-8 flex items-center justify-center left="-8 md:-10">
                <div i-ic-round-double-arrow absolute transition-all :class="exerciceIsRunning(index) ? 'translate-x-0' : 'opacity-0 -translate-x-5'" />
                <div i-ic-round-pause absolute transition-all :class="exerciceIsResting(index) ? 'translate-x-0' : 'opacity-0 -translate-x-5'" />
              </div>
              <span v-if="showExerciceIndex"><span font-mono>{{ index + 1 }}</span>. </span>
              {{ capitalizeFirstLetter(exercice) }}
            </li>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>
