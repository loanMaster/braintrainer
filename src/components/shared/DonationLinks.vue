<template>
  <div class="d-flex flex-column">
    <div>
      <a
        href="https://www.paypal.com/donate/?hosted_button_id=6LF9EP8KGAX6L"
        class="btn btn-outline-primary mb-2 mt-2"
        >PayPal</a
      >
    </div>
    <div>
      <span>Ethereum: </span
      ><DonationAddress address="0x51622a619601E51f0a66F59036f7591C6bF1A29F" />
    </div>
    <div>
      <span>Solana: </span
      ><DonationAddress
        address="BRwkLE84SQoz8XTiG3hrN9iwYHTS8YSdnjNMY5qi7r7D"
      />
    </div>
    <div>
      <span>Polkadot: </span
      ><DonationAddress
        address="1YfKQnjEtVsp84PUYcXoSyMnbQjUnaWJmFX1GPNQgeniR1p"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import DonationAddress from 'src/components/shared/DonationAddress.vue';
</script>
