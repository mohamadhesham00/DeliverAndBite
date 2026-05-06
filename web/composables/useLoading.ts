import { ref } from "vue";

const loading = ref(false);

export default function useLoading() {
  function start() {
    loading.value = true;
  }
  function stop() {
    loading.value = false;
  }
  return { loading, start, stop };
}
