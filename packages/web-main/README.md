# Main Takaro app

This is the main frontend app for Takaro.


### Remarks Tanstack-Query and Tanstack-Router

#### Tanstack-Query

- **PlaceholderData**: In react-query each query is identified by a unique `queryKey`. This key plays a crucial role in determining whether to retrieve data from the cache or to treat it as a new request.
In scenarios involving pagniation or filters, queries are assigned a distinct `querykey`. As a result, these queries are not recognized as related, leading each to be processed as a fresh request.
This however, introduces a challenge: transitioning between queries triggers loading states, potentially affecting the user experience by displaying indicators during data updates. 

To address this, `placeholderData` can be used. `placeholderData` has a broader use case, as it can also be used to show initial data. To keep the previous data, react-query has a helper function called `keepPreviousData` which retains data from the previous request and displays it to the user while the new request is being processed. The `queryResult` has a property `isPreviousData` which can be used to e.g. temporary style the data differently (e.g. muted color)

- **mutate() vs mutateAsync()**: mutate doesn't return anything, while `mutateAsync()` returns a Promise containing the result of the mutation. Most of the time you'll want `mutate()`. The only situation where `mutateAsync()` is superior is when
you really need the Promise e.g. When you fire off multiple mutations concurrently and want to wait for them all to be finished. 

#### Tanstack-Router


- **notFound**:  Do NOT use the `notFoundComponent` prop. Tanstack router provides a `NotFound()`. However, our apiClient returns a rejected promise on 404 errors, where react-query in return will automatically throw an error. Meaning the `notFoundComponent` will never be reached. Instead, the `errorComponent` is reached with status 404. We cannot redirect to the NotFound because that now redirects to the parents `notFoundComponent`.

- **loader**: Routes have a prop called loader which allows data to be fetched before the page starts to render. Without that option the page is already rendering and on about the same time the request starts to happen.
The main use case for this are links. Whenever you hover over a link (which points to a certain route), tanstack-router will automatically start a prefetch request. 


The loader property within routes is a powerful feature that enables pre-fetching of data prior to the commencement of the page rendering process. Without this functionality, page rendering and data requests occur almost simultaneously, which can lead to less efficient loading times. A key application of the loader property is in optimizing link interactions. Specifically, when you hover over a link directed to a certain route, the tanstack-router proactively initiates a prefetch request. This preemptive action ensures that the necessary data is already being loaded by the time you click the link, facilitating a smoother and faster navigation experience.

