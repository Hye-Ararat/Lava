const fs = require("fs");
const path = require("path");

async function addAudit(server_id, audit) {
  const file_path = path.join(
    __dirname,
    `../../storage/v1/audit_logs/servers/${server_id}.json`
  );
  try {
    console.log(audit);
    const addData = () => {
      fs.readFile(file_path, function (err, data) {
        if (err) {
          console.log(err);
        } else {
          var existing_data = JSON.parse(data);
          existing_data.push(audit);
          fs.writeFile(
            file_path,
            JSON.stringify(existing_data),
            function (err) {
              if (err) {
                return "Error"
              } else {
                return "Success"
              }
            }
          );
        }
      });
    };
    if (!fs.existsSync(file_path)) {
      console.log("creating");
      fs.writeFile(file_path, "[]", function (err) {
        if (err) {
          console.log(err);
        } else {
          addData();
        }
      });
    } else {
      addData();
    }
  } catch (error) {
    console.log(error);
  }
  fs.existsSync(file_path);
}

module.exports = { addAudit };
