<script lang="ts">
  // Utils
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { registrationSchema } from '$lib/validations/auth';
  import * as flashModule from 'sveltekit-flash-message/client';

  // Components
  import * as Form from '$components/ui/form';
  import { Input } from '$components/ui/input';
  import { Button } from '$components/ui/button';
  import * as Card from '$components/ui/card';

  // Icons
  import { Reload, GithubLogo, LinkedinLogo } from 'svelte-radix';

  export let data;

  const form = superForm(data.form, {
    validators: zodClient(registrationSchema),
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
    <Card.Title class="text-2xl">Create an account</Card.Title>
    <Card.Description>Enter your email below to create your account</Card.Description>
  </Card.Header>
  <Card.Content class="grid gap-4">
    <div class="grid grid-cols-2 gap-6">
      <Button variant="outline">
        <GithubLogo class="mr-2 h-4 w-4" />
        Github
      </Button>
      <Button variant="outline">
        <LinkedinLogo class="mr-2 h-4 w-4" />
        LinkedIn
      </Button>
    </div>
    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <span class="w-full border-t" />
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="bg-card px-2 text-muted-foreground"> Or continue with </span>
      </div>
    </div>
    <form method="POST" action="?/register" use:enhance>
      <Form.Field {form} name="email" let:constraints>
        <Form.Control let:attrs>
          <Form.Label>Email</Form.Label>
          <Input
            type="email"
            autocapitalize="none"
            autocorrect="off"
            autocomplete="username"
            bind:value={$formData.email}
            {...attrs}
            {...constraints}
          />
          <Form.FieldErrors />
        </Form.Control>
      </Form.Field>

      <Form.Field {form} name="password" let:constraints>
        <Form.Control let:attrs>
          <Form.Label>Password</Form.Label>
          <Input
            type="password"
            autocomplete="new-password"
            bind:value={$formData.password}
            {...attrs}
            {...constraints}
          />
          <Form.FieldErrors />
        </Form.Control>
      </Form.Field>

      <Form.Field {form} name="passwordConfirmation" let:constraints>
        <Form.Control let:attrs>
          <Form.Label>Password Confirmation</Form.Label>
          <Input
            type="password"
            autocomplete="new-password"
            bind:value={$formData.passwordConfirmation}
            {...attrs}
            {...constraints}
          />
          <Form.FieldErrors />
        </Form.Control>
      </Form.Field>

      <Form.Button disabled={$delayed} class="my-2 w-full">
        {#if $delayed}
          <Reload class="mr-2 h-4 w-4 animate-spin" />
        {/if}
        Register
      </Form.Button>
    </form>
  </Card.Content>
</Card.Root>
