<script lang="ts">
  import { page } from '$app/stores';
  import { Toaster as Sonner, type ToasterProps as SonnerProps } from 'svelte-sonner';

  type $$Props = SonnerProps;
</script>

<Sonner
  theme={$page.data.theme ?? 'system'}
  class="toaster group"
  toastOptions={{
    classes: {
      toast:
        'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
      description: 'group-[.toast]:text-muted-foreground',
      actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
      cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground'
    }
  }}
  {...$$restProps}
/>
