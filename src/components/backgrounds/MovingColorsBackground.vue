<template>
  <div class="animated-bg"></div>
</template>

<style lang="scss" scoped>
@mixin dots($count) {
  $text-shadow: ();
  @for $i from 0 through $count {
    $text-shadow: $text-shadow,
      (-0.5+ (random()) * 3) +
        em
        (-0.5+ (random()) * 3) +
        em
        7px
        hsla(random() * 360, 100%, 50%, 0.9);
  }
  text-shadow: $text-shadow;
}

.animated-bg {
  display: block;
  font-size: 52px;
  color: transparent;
  pointer-events: none;
}

.animated-bg::before,
.animated-bg::after {
  position: fixed;
  top: 50%;
  left: 50%;
  width: 3em;
  height: 3em;
  content: '.';
  mix-blend-mode: screen;
  animation: 44s -27s move infinite ease-in-out alternate;
}

.animated-bg::before {
  @include dots(20);
  animation-duration: 34s;
  animation-delay: -27s;
}

.animated-bg::after {
  @include dots(20);
  animation-duration: 33s;
  animation-delay: -32s;
}

@keyframes move {
  from {
    transform: rotate(0deg) scale(12) translateX(-20px);
  }
  to {
    transform: rotate(360deg) scale(18) translateX(20px);
  }
}
</style>
