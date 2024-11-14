const express = require("express");
const app = express();
const session = require("express-session");
const flash = require("express-flash");
const port = 3000;
const path = require("path");
const hbs = require("hbs");
const config = require("./src/config/config.json");
const { Sequelize, QueryTypes } = require("sequelize");
const sequelize = new Sequelize(config.development);
const bcrypt = require("bcrypt");
const Handlebars = require("hbs");

Handlebars.registerHelper("eq", function (a, b) {
    return a === b;
});

// Middleware
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "./src/views"));
app.use("/assets", express.static(path.join(__dirname, 'assets')));
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
      name: "my-session",
      secret: "secret",
      resave: false,
      saveUninitialized: true,
      cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24,
      },
    })
  );
  app.use(flash());

app.use((req, res, next) => {
    res.locals.user = req.session.user;
    next();
});

// Routes
app.get("/", collection);
app.post("/", postAddCollection);
app.get("/login", login);
app.get("/register", register);
app.post("/login", loginPost);
app.post("/register", registerPost);
app.post("/logout", logoutPost);
app.get("/:collectionId/task", getTasks);
app.post("/:collectionId/task", postAddTask);
app.post("/task/update", postCompleteTask);
app.post("/task/delete/:taskId", deleteTask);
app.get("/edit/:collectionId", editCollection);
app.post("/edit/:collectionId", postEditCollection);
app.post("/delete/:collectionId", deleteCollection);

async function collection(req, res) {
    if (!req.session.user) {
        req.flash("error", "Silakan login untuk melihat koleksi.");
        return res.redirect("/login");
    }

    const collections = await sequelize.query(
        `SELECT * FROM collections_tb WHERE user_id = :userId`,
        {
            replacements: { userId: req.session.user.id },
            type: QueryTypes.SELECT
        }
    );

    for (const collection of collections) {
        const tasks = await sequelize.query(
            `SELECT * FROM task_tb WHERE collections_id = :collectionId`,
            {
                replacements: { collectionId: collection.id },
                type: QueryTypes.SELECT
            }
        );

        const completedTasksCount = tasks.filter(task => task.is_done).length;
        const totalTasksCount = tasks.length;

        collection.completedTasksCount = completedTasksCount;
        collection.totalTasksCount = totalTasksCount;
    }

    res.render("collections", {
        collections,
        success_msg: req.flash("success"),
        error_msg: req.flash("error")
    });
}


async function postAddCollection(req, res) {
    if (!req.session.user) {
        req.flash("error", "Silakan login untuk menambahkan collection.");
        return res.redirect("/login");
    }

    const { name } = req.body;

    try {
        await sequelize.query(
            `INSERT INTO collections_tb (name, user_id) VALUES (:name, :userId)`,
            {
                replacements: { name, userId: req.session.user.id },
                type: QueryTypes.INSERT
            }
        );

        req.flash("success", "Collection berhasil ditambahkan!");
        res.redirect("/");
    } catch (error) {
        console.error(error);
        req.flash("error", "Gagal menambahkan collection");
        res.redirect("/");
    }
}

async function editCollection(req, res) {
    const collectionId = req.params.collectionId;

    const collection = await sequelize.query(
        `SELECT * FROM collections_tb WHERE id = :collectionId AND user_id = :userId`,
        {
            replacements: { collectionId, userId: req.session.user.id },
            type: QueryTypes.SELECT
        }
    );

    if (collection.length === 0) {
        req.flash("error", "Collection tidak ditemukan atau Anda tidak memiliki akses.");
        return res.redirect("/");
    }

    res.render("editCollection", {
        collection: collection[0],
        success_msg: req.flash("success"),
        error_msg: req.flash("error")
    });
}

async function postEditCollection(req, res) {
    const collectionId = req.params.collectionId;
    const { name } = req.body;

    try {
        await sequelize.query(
            `UPDATE collections_tb SET name = :name WHERE id = :collectionId`,
            {
                replacements: { name, collectionId },
                type: QueryTypes.UPDATE
            }
        );

        req.flash("success", "Collection berhasil diperbarui!");
        res.redirect("/");
    } catch (error) {
        console.error(error);
        req.flash("error", "Gagal memperbarui collection");
        res.redirect("/");
    }
}

async function deleteCollection(req, res) {
    const collectionId = req.params.collectionId;

    try {
        const collection = await sequelize.query(
            `SELECT * FROM collections_tb WHERE id = :collectionId AND user_id = :userId`,
            {
                replacements: { collectionId, userId: req.session.user.id },
                type: QueryTypes.SELECT
            }
        );

        if (collection.length === 0) {
            req.flash("error", "Collection tidak ditemukan atau Anda tidak memiliki akses.");
            return res.redirect("/");
        }

        await sequelize.query(
            `DELETE FROM task_tb WHERE collections_id = :collectionId`,
            {
                replacements: { collectionId },
                type: QueryTypes.DELETE
            }
        );

        await sequelize.query(
            `DELETE FROM collections_tb WHERE id = :collectionId`,
            {
                replacements: { collectionId },
                type: QueryTypes.DELETE
            }
        );

        req.flash("success", "Collection berhasil dihapus!");
        res.redirect("/");
    } catch (error) {
        console.error(error);
        req.flash("error", "Gagal menghapus collection");
        res.redirect("/");
    }
}

async function getTasks(req, res) {
    const collectionId = req.params.collectionId;

    if (!req.session.user) {
        req.flash("error", "Silakan login untuk melihat tugas.");
        return res.redirect("/login");
    }

    const tasks = await sequelize.query(
        `SELECT * FROM task_tb WHERE collections_id = :collectionId`,
        {
            replacements: { collectionId },
            type: QueryTypes.SELECT
        }
    );

    const collection = await sequelize.query(
        `SELECT name FROM collections_tb WHERE id = :collectionId AND user_id = :userId`,
        {
            replacements: { collectionId, userId: req.session.user.id },
            type: QueryTypes.SELECT
        }
    );

    if (collection.length === 0) {
        req.flash("error", "Collection tidak ditemukan atau Anda tidak memiliki akses.");
        return res.redirect("/");
    }

    const incompleteTasksCount = tasks.filter(task => !task.is_done).length;
    const completedTasksCount = tasks.filter(task => task.is_done).length;

    res.render("task", {
        collectionId,
        collectionName: collection[0] ? collection[0].name : "Unknown Collection", // Ambil nama koleksi
        tasks,
        incompleteTasksCount,
        completedTasksCount,
        success_msg: req.flash("success"),
        error_msg: req.flash("error")
    });
}

async function postAddTask(req, res) {
    const collectionId = req.params.collectionId;

    if (!req.session.user) {
        req.flash("error", "Silakan login untuk menambahkan task.");
        return res.redirect("/login");
    }

    const { name } = req.body;

    try {
        await sequelize.query(
            `INSERT INTO task_tb (name, is_done, collections_id) VALUES (:name, FALSE, :collectionId)`,
            {
                replacements: { name, collectionId },
                type: QueryTypes.INSERT
            }
        );

        req.flash("success", "Task berhasil ditambahkan!");
        res.redirect(`/${collectionId}/task`);
    } catch (error) {
        console.error(error);
        req.flash("error", "Gagal menambahkan task");
        res.redirect(`/${collectionId}/task`);
    }
}

async function postCompleteTask(req, res) {
    const checkedTaskIds = req.body.tasks || [];
    const collectionId = req.body.collectionId;

    if (!req.session.user) {
        req.flash("error", "Silakan login untuk memperbarui status tugas.");
        return res.redirect("/login");
    }

    try {
        const allTasks = await sequelize.query(
            `SELECT id FROM task_tb WHERE collections_id = :collectionId`,
            {
                replacements: { collectionId },
                type: QueryTypes.SELECT,
            }
        );

        const allTaskIds = allTasks.map((task) => task.id.toString());
        const unCheckedTaskIds = allTaskIds.filter((id) => !checkedTaskIds.includes(id));

        if (checkedTaskIds.length > 0) {
            await sequelize.query(
                `UPDATE task_tb SET is_done = TRUE WHERE id IN (${checkedTaskIds.join(", ")})`,
                {
                    type: QueryTypes.UPDATE,
                }
            );
        }

        if (unCheckedTaskIds.length > 0) {
            await sequelize.query(
                `UPDATE task_tb SET is_done = FALSE WHERE id IN (${unCheckedTaskIds.join(", ")})`,
                {
                    type: QueryTypes.UPDATE,
                }
            );
        }

        req.flash("success", "Status tugas berhasil diperbarui!");
        res.redirect(`/${collectionId}/task`);
    } catch (error) {
        console.error(error);
        req.flash("error", "Gagal memperbarui status tugas.");
        res.redirect(`/${collectionId}/task`);
    }
}

async function deleteTask(req, res) {
    const taskId = req.params.taskId;

    try {
        const task = await sequelize.query(
            `SELECT * FROM task_tb WHERE id = :taskId AND collections_id IN (SELECT id FROM collections_tb WHERE user_id = :userId)`,
            {
                replacements: { taskId, userId: req.session.user.id },
                type: QueryTypes.SELECT
            }
        );

        if (task.length === 0) {
            req.flash("error", "Task tidak ditemukan atau Anda tidak memiliki akses.");
            return res.redirect("/");
        }

        // Hapus tugas
        await sequelize.query(
            `DELETE FROM task_tb WHERE id = :taskId`,
            {
                replacements: { taskId },
                type: QueryTypes.DELETE
            }
        );

        req.flash("success", "Task berhasil dihapus!");
        res.redirect(`/${task[0].collections_id}/task`);
    } catch (error) {
        console.error(error);
        req.flash("error", "Gagal menghapus task");
        res.redirect("/");
    }
}

function login(req, res) {
  res.render("login");
}

async function loginPost(req, res) {
  const { email, password } = req.body;

  const query = `SELECT * FROM users_tb WHERE email = '${email}'`;
  const user = await sequelize.query(query, { type: QueryTypes.SELECT });

  if (!user.length) {
    req.flash("error", "Invalid email or password");
    return res.redirect("/login");
  }

  const isVerifiedPassword = await bcrypt.compare(password, user[0].password);

  if (!isVerifiedPassword) {
    req.flash("error", "Invalid email or password");
    return res.redirect("/login");
  }

  req.flash("success", "Login success");
  req.session.user = user[0];
  res.redirect("/");
}

function register(req, res) {
  res.render("register");
}

async function registerPost(req, res) {
  try {
    const { email, username, password } = req.body;

    const checkEmail = await sequelize.query(
      `SELECT * FROM users_tb WHERE email = '${email}'`,
      { type: QueryTypes.SELECT }
    );

    if (checkEmail.length > 0) {
      req.flash("error", "Email already registered");
      return res.redirect("/register");
    }

    const salt = 10;
    const hashedPassword = await bcrypt.hash(password, salt);

    const query = `INSERT INTO users_tb(email, username, password) VALUES ('${email}', '${username}', '${hashedPassword}')`;
    await sequelize.query(query, { type: QueryTypes.INSERT });

    req.flash("success", "Registration successful! Please login.");
    res.redirect("/login");
  } catch (error) {
    console.error(error);
    req.flash("error", "Registration failed");
    res.redirect("/register");
  }
}

function logoutPost(req, res) {
    req.session.destroy((err) => {
      if (err) return console.error("Logout gagal!");
  
      console.log("Logout berhasil!");
  
      res.redirect("/");
    });
  }

app.listen(port, () => {
  console.log(`Server berjalan di port ${port}`);
});
