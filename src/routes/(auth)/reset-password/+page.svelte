<script lang="ts">
  // Utils
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { requestPasswordResetSchema } from '$lib/validations/auth';
  import * as flashModule from 'sveltekit-flash-message/client';

  // Components
  import * as Form from '$components/ui/form';
  import { Input } from '$components/ui/input';
  import * as Card from '$components/ui/card';

  // Icons
  import { Reload } from 'radix-icons-svelte';

  export let data;

  const form = superForm(data.form, {
    validators: zodClient(requestPasswordResetSchema),
    invalidateAll: true,
    delayMs: 500,
    multipleSubmits: 'prevent',
    syncFlashMessage: false,
    flashMessage: {
      module: flashModule
    }
  });

  const { form: formData, enhance, delayed } = form;
</script>

<Card.Root>
  <Card.Header class="space-y-1">
    <Card.Title class="text-2xl">Request Password Reset</Card.Title>
  </Card.Header>
  <Card.Content class="grid gap-4">
    <form method="POST" action="?/requestPasswordReset" use:enhance>
      <Form.Field {form} name="email" let:constraints>
        <Form.Control let:attrs>
          <Form.Label>Email</Form.Label>
          <Input
            type="email"
            autocapitalize="none"
            autocorrect="off"
            bind:value={$formData.email}
            {...attrs}
            {...constraints}
          />
          <Form.FieldErrors />
        </Form.Control>
        <Form.Description class="mt-1.5">We will send you a password reset link</Form.Description>
      </Form.Field>

      <Form.Button disabled={$delayed} class="my-2 w-full">
        {#if $delayed}
          <Reload class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        Send
      </Form.Button>
    </form>
  </Card.Content>
</Card.Root>
