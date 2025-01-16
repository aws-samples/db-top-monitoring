
export const configuration = 
{
    "apps-settings": {
        "refresh-interval": 10*1000,
        "refresh-interval-rds": 5*1000,
        "refresh-interval-clw": 20*1000,
        "refresh-interval-elastic": 5*1000,
        "refresh-interval-documentdb-metrics": 5*1000,
        "refresh-interval-documentdb-sessions": 5*1000,
        "refresh-interval-aurora-pgs-sessions": 10*1000,
        "refresh-interval-dynamodb": 5*1000,
        "refresh-interval-update": 5*1000,
        "refresh-interval-aurora-limitless": 10*1000,
        "items-per-page-aurora": 16,
        "items-per-page-documentdb": 64,
        "api_url": "",
        "release" : "0.1.3",
        "release-enforcement" : false,
        "application-title": "DBTop Monitoring",
        "version-code-url" : "https://version.code.ds.wwcs.aws.dev/",
        "items-per-page": 10
    },
    "colors": {
        "fonts" : {
            "metric102" : "#4595dd",
            "metric101" : "#e59400",
            "metric100" : "",
        },
        "lines" : {
            "separator100" : "#737c85",
            "separator101" : "#9e9b9a"
        }
    }
};

export const SideMainLayoutHeader = { text: 'Database Services', href: '#/' };

export const SideMainLayoutMenu = [
    { type: "link", text: "Home", href: "/" },
    {
      text: 'Relational Engines',
      type: 'section',
      defaultExpanded: true,
      items: [
        { type: 'link', text: 'RDS Instances', href: '/rds/instances/' },
        { type: 'link', text: 'Aurora Clusters', href: '/clusters/aurora/'},
      ],
    },
    { type: "divider" },
    {
      text: 'NON-Relational Engines',
      type: 'section',
      defaultExpanded: true,
      items: [
        { type: 'link', text: 'ElastiCache Clusters', href: '/clusters/elasticache/' },
        { type: 'link', text: 'MemoryDB Clusters', href: '/clusters/memorydb/'},
        { type: 'link', text: 'DocumentDB Clusters', href: '/clusters/documentdb/'},
        { type: 'link', text: 'DynamoDB Tables', href: '/tables/dynamodb/'},
      ],
    },
    { type: "divider" },
    { type: 'link', text: 'Application Update', href: '/update/'},
    { type: 'link', text: 'Engine Connections', href: '/connections/'},
    {
          type: "link",
          text: "Documentation",
          href: "https://github.com/aws-samples/db-top-monitoring",
          external: true,
          externalIconAriaLabel: "Opens in a new tab"
    }
  ];


export const breadCrumbs = [{text: 'Service',href: '#',},{text: 'Resource search',href: '#',},];



  