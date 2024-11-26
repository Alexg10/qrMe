<template>
  <Card>
    <CardHeader class="pb-2">
      <CardDescription>This Week</CardDescription>
      <CardTitle class="text-4xl"> 29 views </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="text-xs text-muted-foreground">+25% from last week</div>
    </CardContent>
    <CardFooter>
      <Progress :model-value="25" aria-label="25% increase" />
    </CardFooter>
  </Card>
  <Card>
    <CardHeader class="pb-2">
      <CardDescription>This Month</CardDescription>
      <CardTitle class="text-3xl"> 359 views </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="text-xs text-muted-foreground">+10% from last month</div>
    </CardContent>
    <CardFooter>
      <Progress :model-value="12" aria-label="12% increase" />
    </CardFooter>
  </Card>
</template>
