import pynecone as pc


class State(pc.State):
    count: int = 3

    def increment(self):
        self.count += 1

    def decrement(self):
        self.count -= 1


def index():

    return pc.vstack(
        pc.breadcrumb(
    pc.breadcrumb_item(
        pc.breadcrumb_link("Home", href="#")
    ),
    pc.breadcrumb_item(
        pc.breadcrumb_link("Docs", href="#")
    ),
    pc.breadcrumb_item(
        pc.breadcrumb_link("Breadcrumb", href="#")
    ),
),

        pc.heading(State.count, font_size="2em"),
        pc.button(
            "-",
            color_scheme="green",
            border_radius="1em",
            on_click=State.increment,
        ),
        pc.button(
            "+",
            color_scheme="red",
            border_radius="1em",
            on_click=State.decrement,
        ),
        pc.text("Hello World!", color="blue", font_size="1.5em"),
        pc.circular_progress(
            pc.circular_progress_label("50", color="green"),
            value=State.count,
        ),
        pc.circular_progress(
            pc.circular_progress_label("∞", color="rgb(107,99,246)"),
            is_indeterminate=True,
        ),
        pc.avatar(
            name="John Boe",
        ),
        pc.button(
            "Fancy Button",
            border_radius="1em",
            box_shadow="rgba(151, 65, 252, 0.8) 0 15px 30px -10px",
            background_image="linear-gradient(144deg,#AF40FF,#5B42F3 50%,#00DDEB)",
            box_sizing="border-box",
            color="white",
            _hover={
                "opacity": 0.85,
            },
        ),
        pc.markdown(
            """# markdown
Support us at **[Pynecone](https://pynecone.io)**.
Format your `inline_code` easily.
"""
        ),
    )


def about():
    return pc.text("About Page")


@pc.route(route="/app", title="My Beautiful App")
def app():

    return pc.text("A Beautiful App")


@pc.route(route="/navbar", title="navbar")
def navbar():
    return pc.box(
        pc.hstack(
            pc.image(src="favicon.ico"),
            pc.heading("My App"),
        ),
        pc.spacer(),
        pc.menu(
            pc.menu_button("Menu"),
            pc.menu_button("Menu2"),
        ),
        position="fixed",
        width="100%",
        top="0px",
        z_index="5",
    )

app = pc.App(state=State)
app.add_page(index, route="/", title="Home")
app.add_page(about, route="/about")
app.compile()
