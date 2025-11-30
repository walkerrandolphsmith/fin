# Title

Hello everyone, my name is Walker Smith, and today I’ll be presenting Fin, a household financial coordination system designed to bring clarity, structure, and collaboration to family money management.

## Introduction

Most budgeting tools assume that one person manages everything: every bill, every budget category, every payment source.
But in most households, responsibilities are divided. Often one partner pays bills, while another manages budgets, and one handles investments or long-term planning.

## What Fin is

fin rethinks the traditional “single user budgeting app” model and instead provides a coordinated platform that supports shared financial responsibilities while keeping everyone aligned toward the same goals.

Now let's explore some of the core features of fin.

Here is an overview of monthly bills. At a glance I can see when each bill is due and how much is owed.

Fin supports full create, read, update, delete operations for bills.

So when I select the Natural Gas bill I can get more details.

Let's change the due date to Nov 28. I am billed by usage so I don't pay the same amount every month. Let's change the amount type to variable.

We can track what payment source is used for our bills. This is handy when a card expires or is lost or stolen and we need to know which service providers we need to update payment information for.

I can also set the payment portal to help keep track of how I pay bills. Not every provider has a convenient app.

I can delete bills when they are no longer relevant or add new ones when life changes.

Entering in bill information manually can be a chore. Let's import a bill from a pdf. I'll select the power bill I received from GA power this month.

fin tries extracting bill details with a few different strategies like text heuristics and LLM powered assistance.

I like to keep my bills organized so I'll reorder them to put the power bill with the other utilities

Once my bills are setup, they don't change often, but it is helpful to know which bills are due soon. I can easily filter to see what bills are due this week and next week to ensure I never miss a payment.

In my household I am the bill manager while my wife manages the budget. She knows when we have extra spending for birthday parties and events and I can help her balance spending with the total bill expenses at a glance. This month over 3 grand.

Fin also provides lightweight management of payment sources like my debit card and bank accounts. These are the accounts bills get paid from.

We don't use our credit cards so let's delete it. Fin supports fully atomic transactions which means any bills related to this payment source are guaranteed to get unassociated.

Fin exposes a fully compliant OpenAPI specification as well as SwaggerUI to encourage integration with other systems. You can explore and interact directly with the HTTP REST API here. Complete with diagnostic endpoints for service excellence.

Since fin was built with domain driven design principals the business rules are completely decoupled from the persistence layer and the presentation layer. That means I was able to rapidly create a command line interface application to integrate with fin. Let's check it out

You can view bills, get their details and even filter on the time horizons when saw in the web.

## Technology

Now let's dig into the underlying tech. Fin is composed of several independent npm packages managed with yarn workspaces. This means each package is completely standalone and can't reach into other packages by file path.

The domain package encapsulates all the entities and business rules as they would be described by a layman using the application. Classes such as Bill, PaymentSource and rules such as bill amounts being positive numbers. Even when the presentation or persistence layer changes we can rely on these rules being enforced in the domain layer. The factory pattern was used to ensure bills are created with specific default values.

The infrastructure package encapsulates the persistence technologies such as mongoDB and mongoose object modeling. I used the adapter pattern to hide all the complexity of the persistence layer behind a repository interface.

The application package orchestrates use cases of the domain such as reordering bills or changing their details.
Every distinct type of change to a bill is represented as a mutation. I used the strategy pattern so that each mutation operation could be encapsulated in its own class that each implement the same interface so a bill service can choose the appropriate strategy and apply the mutation.

The unit of work pattern was used to enable transactional operations for deletion of payment source so the infrastructure layer would not leak outside its boundary.

Filtering bills by time horizon is another use case in this layer. I used the specification pattern to encapsulate the business rules around filtering by due date to classes that implement the ISpecification<Bill> interface. The bill service can delegate filtering to these classes which have a `isSatisfiedBy` method that matches bills.

Concrete implementations for BillsDueThisWeek and BillsDueNextWeek both extended from a common abstract class so I could leverage the template pattern to augment a shared algorithm between the two subclasses.

When extracting bill details from a PDF I implemented several distinct parsers that all implement the same interface and each expose a confidence score. For example one parser extracts raw text and applies hueristics to match bill details while another uses Anthropic's claude LLM to directly provide the pdf in a prompt to the model. I used the decorator pattern to create yet another concrete implementation of the interface that runs all the parsers concurrently and selects the the results with the highest confidence score. This allows me to augment the behavior of parsers while keeping them closed to modification.

The sdk package provides an improved developer experience for interacting with the FIN REST API. The API requires specific knowledge of URLs for each endpoint, HTTP headers and handling of responses. I used the facade pattern to hide those details behind the SDK that exposes simple to use methods like getBills()

Lastly the web application was developed using Next.js, React, tailwind and a variety of off the shelf components for date selection, accordion and modal interactions. The CLI application was developed using commander.js, chalk and few helper libraries. Every package was written in typescript and both applications run on Node runtime.

In addition, both applications used the ioc package which used an IOC container to register dependencies centrally. I used the singleton pattern here to ensure a single instance of the container registry was used across the applications.
