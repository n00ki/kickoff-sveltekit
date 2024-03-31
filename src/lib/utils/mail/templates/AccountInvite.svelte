<script lang="ts">
  import { Heading, Hr, Html, Button } from 'svelty-email';
  export let url: string;
</script>

<Html lang="en">
  <Heading as="h1">You are invited to join our Kickoff SvelteKit account</Heading>
  <Button href={url}>Click here to join</Button>
  <Hr />
</Html>
