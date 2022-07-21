(function() {
  // Create the connector object
  var myConnector = tableau.makeConnector();
  
  //Google Sheets variables
  const id = '1-7PdCI2NawSgP1QE-cGYVYedetYqepR-4jBweaJyqFo';
  const gids = {
    'federal_annual_lobbying': '1514852987',
    'federal_outside_spending': '1005005713',
    'state_annual_lobbying': '993468030',
    'congressional_gun_lobbying': {
      '2020': '969270108',
      '2018': '673121545',
      '2016': '0'
    }
  };

  // Define the schema
  myConnector.getSchema = function(schemaCallback) {
    // Schema for Federal Annual Lobbying
    const fedAnnLob_cols = [{
      id: "year",
      alias: "Year (Fed)",
      dataType: tableau.dataTypeEnum.int
    }, {
      id: "gun_control",
      alias: "Federal Gun Control Lobbying",
      dataType: tableau.dataTypeEnum.float,
      numberFormat: tableau.numberFormatEnum.currency
    }, {
      id: "gun_rights",
      alias: "Federal Gun Rights Lobbying",
      dataType: tableau.dataTypeEnum.float,
      numberFormat: tableau.numberFormatEnum.currency
    }, {
      id: "gun_manufacturing",
      alias: "Federal Gun Manufacturing Lobbying",
      dataType: tableau.dataTypeEnum.float,
      numberFormat: tableau.numberFormatEnum.currency
    }];
    const fedAnnLob_table = {
      id: "federal_annual_lobbying",
      alias: "Federal Annual Lobbying",
      columns: fedAnnLob_cols
    };
    
    //Schema for Federal Outside Spending
    const fedOutSpe_cols = [{
      id: 'cycle',
      alias: 'Election Cycle (Fed)',
      dataType: tableau.dataTypeEnum.int
    }, {
      id: 'gun_control',
      alias: 'Gun Control Outside Spending',
      dataType: tableau.dataTypeEnum.float,
      numberFormat: tableau.numberFormatEnum.currency
    }, {
      id: 'gun_rights',
      alias: 'Gun Rights Outside Spending',
      dataType: tableau.dataTypeEnum.float,
      numberFormat: tableau.numberFormatEnum.currency
    }];
    const fedOutSpe_table = {
      id: "federal_outside_spending",
      alias: "Federal Outside Spending",
      columns: fedOutSpe_cols
    };
    
    //Schema for State Annual Lobbying
    const staAnnLob_cols = [{
      id: 'state',
      alias: 'State',
      dataType: tableau.dataTypeEnum.string,
      geoRole: tableau.geographicRoleEnum.state_province
    }, {
      id: 'year',
      alias: 'Year (State)',
      dataType: tableau.dataTypeEnum.int
    }, {
      id: 'gun_control',
      alias: 'State Gun Control Lobbying',
      dataType: tableau.dataTypeEnum.float,
      numberFormat: tableau.numberFormatEnum.currency
    }, {
      id: 'gun_rights',
      alias: 'State Gun Rights Lobbying',
      dataType: tableau.dataTypeEnum.float,
      numberFormat: tableau.numberFormatEnum.currency
    }];
    const staAnnLob_table = {
      id: "state_annual_lobbying",
      alias: "State Annual Lobbying",
      columns: staAnnLob_cols
    };
    
    //Schema for Congress
    const congress_cols = [{
      id: 'name',
      alias: 'Name',
      dataType: tableau.dataTypeEnum.string
    }, {
      id: 'party',
      alias: 'Party',
      dataType: tableau.dataTypeEnum.string
    }, {
      id: 'cycle_congress',
      alias: 'Election Cycle (Congress)',
      dataType: tableau.dataTypeEnum.int
    }, {
      id: 'office',
      alias: 'Office',
      dataType: tableau.dataTypeEnum.string
    }, {
      id: 'distid',
      alias: 'District ID',
      dataType: tableau.dataTypeEnum.string
    }, {
      id: 'state_inits',
      alias: 'State Initials',
      dataType: tableau.dataTypeEnum.string
    }, {
      id: 'total_contributions_from_gun_control',
      alias: 'Gun Control Contributions',
      dataType: tableau.dataTypeEnum.float,
      numberFormat: tableau.numberFormatEnum.currency
    }, {
      id: 'total_contributions_from_gun_rights',
      alias: 'Gun Rights Contributions',
      dataType: tableau.dataTypeEnum.float,
      numberFormat: tableau.numberFormatEnum.currency
    }, {
      id: 'gun_control_independent_spending_support',
      alias: 'Gun Control Independent Spending Support',
      dataType: tableau.dataTypeEnum.float,
      numberFormat: tableau.numberFormatEnum.currency
    }, {
      id: 'gun_control_independent_spending_opposed',
      alias: 'Gun Control Independent Spending Opposed',
      dataType: tableau.dataTypeEnum.float,
      numberFormat: tableau.numberFormatEnum.currency
    }, {
      id: 'gun_rights_independent_spending_support',
      alias: 'Gun Rights Independent Spending Support',
      dataType: tableau.dataTypeEnum.float,
      numberFormat: tableau.numberFormatEnum.currency
    }, {
      id: 'gun_rights_independent_spending_opposed',
      alias: 'Gun Rights Independent Spending Opposed',
      dataType: tableau.dataTypeEnum.float,
      numberFormat: tableau.numberFormatEnum.currency
    }];
    const congress_table = {
      id: "congressional_gun_lobbying",
      alias: "Congressional Gun Lobbying",
      columns: congress_cols
    };
    
    schemaCallback([fedAnnLob_table, fedOutSpe_table, staAnnLob_table, congress_table]);
  };

    // Download the data
  myConnector.getData = function(table, doneCallback) {
    const tableData = [];
    if(table.tableInfo.id === 'congressional_gun_lobbying') {
      for (let year in gids[table.tableInfo.id]) {
        let apiCall = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&tq&gid=${gids[table.tableInfo.id][year]}`;
        $.getJSON(apiCall, function(resp) {
          const sheet = JSON.parse(resp.match(/(?<=\().*(?=\))/gi)).table;
          //get index of which column is where
          const labelIndexes = {};
          for (let colNum = 0; colNum < sheet.cols.length; colNum++) {
            //only non blank columns
            if (sheet.cols[colNum].label) {
              labelIndexes[sheet.cols[colNum].label.toLowerCase().replace(/\s/g, "_")] = colNum;
            };
          };
          //then get the actual data
          for (let row of sheet.rows) {
            //row by row
            let dataRow = {
              cycle_congress: parseInt(year)
            };
            for (let field in labelIndexes) {
              dataRow[field] = row.c[labelIndexes[field]].v;
              if (field === 'distid') {
                dataRow.state_inits = row.c[labelIndexes[field]].v.substr(0,2);
              };
            };
            tableData.push(dataRow);
          };
        });
      };
    } else {
      const apiCall = `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:json&tq&gid=${gids[table.tableInfo.id]}`;
      $.getJSON(apiCall, function(resp) {
        const sheet = JSON.parse(resp.match(/(?<=\().*(?=\))/gi)).table;
        const labelIndexes = {};
        //get index of which column is where
        for (let colNum = 0; colNum < sheet.cols.length; colNum++) {
          //make sure not blank
          if (sheet.cols[colNum].label) {
            labelIndexes[sheet.cols[colNum].label.toLowerCase().replace(/\s/g, "_")] = colNum;
          };
        };
        //then get data
        for (let row of sheet.rows) {
          const dataRow = {};
          let pushRow = true;
          for (let col of table.tableInfo.columns) {
            //account for total rows
            try {
              //ensure in correct data type
              switch(col.dataType) {
                case tableau.dataTypeEnum.string:
                  dataRow[col.id] = String(row.c[labelIndexes[col.id]].v);
                  break;
                case tableau.dataTypeEnum.int:
                  dataRow[col.id] = parseInt(row.c[labelIndexes[col.id]].v);
                  break;
                case tableau.dataTypeEnum.float:
                  dataRow[col.id] = parseFloat(row.c[labelIndexes[col.id]].v);
                  break;
              };
            } catch(err) {
              pushRow = false;
            };
          };
          if (pushRow) {
            tableData.push(dataRow);
          };
        };
      });
    };
    table.appendRows(tableData);
    doneCallback();
  };
  
  tableau.registerConnector(myConnector);

  // Create event listeners for when the user submits the form
  $(document).ready(function() {
    $('#submitButton').click(function() {
        tableau.connectionName = 'OpenSecrets Guns Data'; // This will be the data source name in Tableau
        tableau.submit(); // This sends the connector object to Tableau
    });
  });
})();
