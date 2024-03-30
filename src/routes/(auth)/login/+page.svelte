<script lang="ts">
  // Utils
  import { superForm } from 'sveltekit-superforms';
  import { zodClient } from 'sveltekit-superforms/adapters';
  import { loginSchema } from '$lib/validations/auth';
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
    validators: zodClient(loginSchema),
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
    <Card.Title class="text-2xl">Login</Card.Title>
    <Card.Description>Enter your email and password below to access your account</Card.Description>
  </Card.Header>
  <Card.Content class="grid gap-4">
    <form method="POST" action="?/login" use:enhance>
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
            autocomplete="current-password"
            bind:value={$formData.password}
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
        Sign In
      </Form.Button>
    </form>

    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <span class="w-full border-t" />
      </div>
      <div class="relative flex justify-center text-xs uppercase">
        <span class="bg-card px-2 text-muted-foreground"> Or continue with </span>
      </div>
    </div>

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
  </Card.Content>
  <Card.Footer>
    <div class="mt-2 flex w-full justify-between">
      <a href="/reset-password" class="text-xs">Forgot your password?</a>
      <a href="/register" class="text-xs">Doesn't have an account yet?</a>
    </div>
  </Card.Footer>
</Card.Root>
