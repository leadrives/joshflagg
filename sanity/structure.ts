import DocumentsPane from 'sanity-plugin-documents-pane'

export const structure = (S) =>
  S.list()
    .title('Content')
    .items([
      // Notable Transactions
      S.listItem()
        .title('Notable Transactions')
        .child(
          S.documentList()
            .title('Notable Transactions')
            .schemaType('property')
            .filter('_type == "property" && listingType == "notable"')
            .initialValueTemplates([
              S.initialValueTemplateItem('property-notable'),
            ])
        ),

      // Exclusive Listings
      S.listItem()
        .title('Exclusive Listings')
        .child(
          S.documentList()
            .title('Exclusive Listings')
            .schemaType('property')
            .filter('_type == "property" && listingType == "exclusive"')
            .initialValueTemplates([
              S.initialValueTemplateItem('property-exclusive'),
            ])
        ),

      S.divider(),

      // Neighborhoods (Customized View)
      S.listItem()
        .title('Neighborhoods / Communities')
        .child(
          S.documentTypeList('neighborhood')
            .title('Neighborhoods')
            .child((neighborhoodId) =>
              S.document()
                .documentId(neighborhoodId)
                .schemaType('neighborhood')
                .views([
                  S.view.form(),
                  S.view
                    .component(DocumentsPane)
                    .options({
                      query: `*[_type == "property" && community._ref == $docId]`,
                      params: {docId: `_id`},
                      options: {perspective: 'published'}
                    })
                    .title('Related Properties'),
                ])
            )
        ),

      S.divider(),

      // All other document types (excludes property and neighborhood)
      ...S.documentTypeListItems().filter(
        (listItem) => !['neighborhood', 'property'].includes(listItem.getId())
      ),

      // All Properties (catch-all view)
      S.listItem()
        .title('All Properties')
        .schemaType('property')
        .child(S.documentTypeList('property').title('All Properties')),
    ])
