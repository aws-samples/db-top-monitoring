import {memo,useState} from 'react';
import {  getMatchesCountText, paginationLabels, pageSizePreference, EmptyState } from './Functions';

import { useCollection } from '@cloudscape-design/collection-hooks';
import {CollectionPreferences,Pagination } from '@cloudscape-design/components';
import TextFilter from "@cloudscape-design/components/text-filter";

import Table from "@cloudscape-design/components/table";
import Header from "@cloudscape-design/components/header";
import Button from "@cloudscape-design/components/button";
import SpaceBetween from "@cloudscape-design/components/space-between";

                                                                
const TableComponent = memo(({columnsTable,visibleContent, dataset, title, description = "", onSelectionItem = () => {}, pageSize = 10, extendedTableProperties = {}, tableActions = null  }) => {

    
    const [selectedItems,setSelectedItems] = useState([{ identifier: "" }]);

    const visibleContentPreference = {
              title: 'Select visible content',
              options: [
                {
                  label: 'Main properties',
                  options: columnsTable.map(({ id, header }) => ({ id, label: header, editable: id !== 'id' })),
                },
              ],
    };

   const collectionPreferencesProps = {
            pageSizePreference,
            visibleContentPreference,
            cancelLabel: 'Cancel',
            confirmLabel: 'Confirm',
            title: 'Preferences',
    };
    
    
    const [preferences, setPreferences] = useState({ pageSize: pageSize, visibleContent: visibleContent });
    
    const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
                dataset,
                {
                  filtering: {
                    empty: <EmptyState title="No records" />,
                    noMatch: (
                      <EmptyState
                        title="No matches"
                        action={<Button onClick={() => actions.setFiltering('')}>Clear filter</Button>}
                      />
                    ),
                  },
                  pagination: { pageSize: preferences.pageSize },
                  sorting: {},
                  selection: {},
                }
    );
    
    function onSelectionChange(item){
      onSelectionItem(item);
    }
    
    
    
    return (
                <Table
                      {...collectionProps}
                      selectionType="single"
                      header={
                        <Header
                          variant="h3"
                          counter= {"(" + dataset.length + ")"} 
                          description={description}
                          actions={tableActions}
                        >
                          {title}
                        </Header>
                      }
                      columnDefinitions={columnsTable}
                      visibleColumns={preferences.visibleContent}
                      items={items}
                      pagination={<Pagination {...paginationProps} ariaLabels={paginationLabels} />}
                      filter={
                        <TextFilter
                          {...filterProps}
                          countText={getMatchesCountText(filteredItemsCount)}
                          filteringAriaLabel="Filter records"
                        />
                      }
                      preferences={
                        <CollectionPreferences
                          {...collectionPreferencesProps}
                          preferences={preferences}
                          onConfirm={({ detail }) => setPreferences(detail)}
                        />
                      }
                      onSelectionChange={({ detail }) => {
                          onSelectionChange(detail.selectedItems);
                          setSelectedItems(detail.selectedItems);
                          }
                        }
                      selectedItems={selectedItems}
                      resizableColumns
                      stickyHeader
                      loadingText="Loading records"
                      {...extendedTableProperties}
                    />

           );
});

export default TableComponent;
