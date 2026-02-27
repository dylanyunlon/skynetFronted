root@iZ7xv051npomtfakwd4555Z:~/dylan/skynetCheapBuy/marimo# tree
.
├── AGENTS.md
├── biome.jsonc
├── CITATION.cff
├── CLAUDE.md
├── codecov.yml
├── CODE_OF_CONDUCT.md
├── CODEOWNERS
├── configs
├── CONTRIBUTING.md
├── dagger
│   ├── pyproject.toml
│   ├── README.md
│   ├── requirements.lock
│   └── src
│       └── main
│           ├── backend.py
│           ├── cli.py
│           ├── env.py
│           ├── frontend.py
│           ├── __init__.py
│           └── main.py
├── dagger.json
├── development_docs
│   ├── adding_backend_and_mcp_tools.md
│   ├── adding_lint_rules.md
│   ├── openapi.md
│   ├── prompts.md
│   ├── pyodide.md
│   ├── testing.md
│   └── traces.md
├── docker
│   ├── Dockerfile
│   └── README.md
├── docs
│   ├── 404.md
│   ├── api
│   │   ├── app.md
│   │   ├── caching.md
│   │   ├── cell.md
│   │   ├── cli_args.md
│   │   ├── control_flow.md
│   │   ├── diagrams.md
│   │   ├── html.md
│   │   ├── index.md
│   │   ├── inputs
│   │   │   ├── anywidget.md
│   │   │   ├── array.md
│   │   │   ├── batch.md
│   │   │   ├── button.md
│   │   │   ├── chat.md
│   │   │   ├── checkbox.md
│   │   │   ├── code_editor.md
│   │   │   ├── data_editor.md
│   │   │   ├── data_explorer.md
│   │   │   ├── dataframe.md
│   │   │   ├── dates.md
│   │   │   ├── dictionary.md
│   │   │   ├── dropdown.md
│   │   │   ├── file_browser.md
│   │   │   ├── file.md
│   │   │   ├── form.md
│   │   │   ├── index.md
│   │   │   ├── matrix.md
│   │   │   ├── microphone.md
│   │   │   ├── multiselect.md
│   │   │   ├── nav_menu.md
│   │   │   ├── number.md
│   │   │   ├── radio.md
│   │   │   ├── range_slider.md
│   │   │   ├── refresh.md
│   │   │   ├── run_button.md
│   │   │   ├── slider.md
│   │   │   ├── switch.md
│   │   │   ├── table.md
│   │   │   ├── tabs.md
│   │   │   ├── text_area.md
│   │   │   └── text.md
│   │   ├── layouts
│   │   │   ├── accordion.md
│   │   │   ├── callout.md
│   │   │   ├── carousel.md
│   │   │   ├── index.md
│   │   │   ├── json.md
│   │   │   ├── justify.md
│   │   │   ├── lazy.md
│   │   │   ├── outline.md
│   │   │   ├── plain.md
│   │   │   ├── routes.md
│   │   │   ├── sidebar.md
│   │   │   ├── stacks.md
│   │   │   ├── stat.md
│   │   │   └── tree.md
│   │   ├── markdown.md
│   │   ├── media
│   │   │   ├── audio.md
│   │   │   ├── download.md
│   │   │   ├── image_compare.md
│   │   │   ├── image.md
│   │   │   ├── index.md
│   │   │   ├── pdf.md
│   │   │   ├── plain_text.md
│   │   │   └── video.md
│   │   ├── miscellaneous.md
│   │   ├── outputs.md
│   │   ├── plotting.md
│   │   ├── query_params.md
│   │   ├── state.md
│   │   ├── status.md
│   │   └── watch.md
│   ├── apps
│   │   ├── embedding_numbers.py
│   │   ├── intro.py
│   │   ├── motherduck.py
│   │   ├── output.py
│   │   ├── README.md
│   │   ├── readme_ui.py
│   │   └── sql.py
│   ├── blocks.py
│   ├── cli.md
│   ├── community.md
│   ├── examples
│   │   ├── index.md
│   │   ├── markdown
│   │   │   ├── admonitions.md
│   │   │   ├── details.md
│   │   │   ├── dynamic_markdown.md
│   │   │   ├── emoji.md
│   │   │   └── mermaid.md
│   │   ├── outputs
│   │   │   ├── basic_markdown.md
│   │   │   ├── basic_output.md
│   │   │   ├── capture_console_outputs.md
│   │   │   ├── conditional_output.md
│   │   │   ├── console_outputs.md
│   │   │   ├── dataframes.md
│   │   │   ├── multiple_outputs.md
│   │   │   ├── plots.md
│   │   │   ├── progress_bar.md
│   │   │   ├── spinner.md
│   │   │   └── stacks.md
│   │   └── running_cells
│   │       ├── async_await.md
│   │       ├── basics.md
│   │       ├── debugging.md
│   │       ├── memory_cache.md
│   │       ├── multiple_definitions.md
│   │       ├── persistent_cache.md
│   │       ├── refresh.md
│   │       ├── run_button.md
│   │       └── stop.md
│   ├── faq.md
│   ├── getting_started
│   │   ├── index.md
│   │   ├── installation.md
│   │   ├── key_concepts.md
│   │   └── quickstart.md
│   ├── guides
│   │   ├── apps.md
│   │   ├── best_practices.md
│   │   ├── coming_from
│   │   │   ├── index.md
│   │   │   ├── jupyter.md
│   │   │   ├── jupytext.md
│   │   │   ├── papermill.md
│   │   │   └── streamlit.md
│   │   ├── configuration
│   │   │   ├── html_head.md
│   │   │   ├── index.md
│   │   │   ├── internationalization.md
│   │   │   ├── llm_providers.md
│   │   │   ├── runtime_configuration.md
│   │   │   ├── snippets.md
│   │   │   └── theming.md
│   │   ├── debugging.md
│   │   ├── deploying
│   │   │   ├── authentication.md
│   │   │   ├── deploying_docker.md
│   │   │   ├── deploying_hugging_face.md
│   │   │   ├── deploying_kubernetes.md
│   │   │   ├── deploying_nginx.md
│   │   │   ├── deploying_public_gallery.md
│   │   │   ├── deploying_railway.md
│   │   │   ├── deploying_skypilot.md
│   │   │   ├── deploying_slurm.md
│   │   │   ├── index.md
│   │   │   ├── prebuilt_containers.md
│   │   │   ├── programmatically.md
│   │   │   └── scheduled.md
│   │   ├── editor_features
│   │   │   ├── agents.md
│   │   │   ├── ai_completion.md
│   │   │   ├── dataflow.md
│   │   │   ├── home.md
│   │   │   ├── hotkeys.md
│   │   │   ├── index.md
│   │   │   ├── language_server.md
│   │   │   ├── mcp.md
│   │   │   ├── module_autoreloading.md
│   │   │   ├── overview.md
│   │   │   ├── package_management.md
│   │   │   ├── panels.md
│   │   │   ├── tools.md
│   │   │   └── watching.md
│   │   ├── expensive_notebooks.md
│   │   ├── exporting.md
│   │   ├── generate_with_ai
│   │   │   ├── index.md
│   │   │   ├── prompts.md
│   │   │   ├── skills.md
│   │   │   ├── text_to_notebook.md
│   │   │   └── using_claude_code.md
│   │   ├── index.md
│   │   ├── integrating_with_marimo
│   │   │   ├── custom_ui_plugins.md
│   │   │   ├── displaying_objects.md
│   │   │   └── index.md
│   │   ├── interactivity.md
│   │   ├── island_example.md
│   │   ├── lint_rules
│   │   │   ├── index.md
│   │   │   └── rules
│   │   │       ├── branch_expression.md
│   │   │       ├── cycle_dependencies.md
│   │   │       ├── empty_cells.md
│   │   │       ├── general_formatting.md
│   │   │       ├── invalid_syntax.md
│   │   │       ├── markdown_dedent.md
│   │   │       ├── markdown_indentation.md
│   │   │       ├── misc_log_capture.md
│   │   │       ├── multiple_definitions.md
│   │   │       ├── parse_stderr.md
│   │   │       ├── parse_stdout.md
│   │   │       ├── self_import.md
│   │   │       ├── setup_cell_dependencies.md
│   │   │       ├── sql_parse_error.md
│   │   │       └── unparsable_cells.md
│   │   ├── molab.md
│   │   ├── outputs.md
│   │   ├── package_management
│   │   │   ├── importing_packages.md
│   │   │   ├── index.md
│   │   │   ├── inlining_dependencies.md
│   │   │   ├── installing_packages.md
│   │   │   ├── notebooks_in_projects.md
│   │   │   └── using_uv.md
│   │   ├── publishing
│   │   │   ├── cloudflare.md
│   │   │   ├── community_cloud
│   │   │   │   └── index.md
│   │   │   ├── deploy.md
│   │   │   ├── embedding.md
│   │   │   ├── from_code_snippets.md
│   │   │   ├── from_github.md
│   │   │   ├── github_pages.md
│   │   │   ├── index.md
│   │   │   ├── mkdocs.md
│   │   │   ├── opengraph.md
│   │   │   ├── playground.md
│   │   │   ├── quarto.md
│   │   │   ├── self_host_wasm.md
│   │   │   ├── thumbnails.md
│   │   │   └── view_outputs_on_github.md
│   │   ├── reactivity.md
│   │   ├── reusing_functions.md
│   │   ├── scripts.md
│   │   ├── state.md
│   │   ├── testing
│   │   │   ├── doctest.md
│   │   │   ├── index.md
│   │   │   └── pytest.md
│   │   ├── troubleshooting.md
│   │   ├── understanding_errors
│   │   │   ├── cycles.md
│   │   │   ├── import_star.md
│   │   │   ├── index.md
│   │   │   ├── multiple_definitions.md
│   │   │   └── setup.md
│   │   ├── wasm.md
│   │   └── working_with_data
│   │       ├── dataframes.md
│   │       ├── index.md
│   │       ├── plotting.md
│   │       ├── remote_storage.md
│   │       └── sql.md
│   ├── hooks.py
│   ├── index.md
│   ├── __init__.py
│   ├── integrations
│   │   ├── google_cloud_bigquery.md
│   │   ├── google_cloud_storage.md
│   │   ├── google_sheets.md
│   │   ├── index.md
│   │   └── motherduck.md
│   ├── overrides
│   │   └── main.html
│   ├── pyproject.toml
│   ├── reading.md
│   ├── recipes.md
│   ├── security.md
│   ├── _static
│   │   ├── ai-completion.mp4
│   │   ├── array.png
│   │   ├── CalSans-SemiBold.woff
│   │   ├── CLAUDE.md
│   │   ├── docs-add-custom-provider.mp4
│   │   ├── docs-ai-completion-codeium-vscode-dark.png
│   │   ├── docs-ai-completion-codeium-vscode-download-diagnostics-dark.png
│   │   ├── docs-ai-completion-codeium-vscode-download-diagnostics.png
│   │   ├── docs-ai-completion-codeium-vscode.png
│   │   ├── docs-ai-completion-custom-assist-rules.png
│   │   ├── docs-ai-completion-gh.png
│   │   ├── docs-ai-completion-preview.mp4
│   │   ├── docs-ai-install.png
│   │   ├── docs-ai-variables.png
│   │   ├── docs-app-config.png
│   │   ├── docs-cell-actions.png
│   │   ├── docs-chart-builder-table.mp4
│   │   ├── docs-claude-code-agent.mp4
│   │   ├── docs-column-explorer-table.mp4
│   │   ├── docs-command-palette.png
│   │   ├── docs_cycles_error.png
│   │   ├── docs-dataflow-dependencies-panel.jpg
│   │   ├── docs-dataflow-dependencies-panel.webp
│   │   ├── docs-dataflow-graph.jpg
│   │   ├── docs-dataflow-graph.webp
│   │   ├── docs-dataflow-minimap.webm
│   │   ├── docs-dataflow-variables-explorer.jpg
│   │   ├── docs-dataflow-variables-explorer.webp
│   │   ├── docs-dataframe-default-setting.png
│   │   ├── docs-dataframe-output.png
│   │   ├── docs-dataframe-table.gif
│   │   ├── docs-dataframe-table.mp4
│   │   ├── docs-dataframe-table.webm
│   │   ├── docs-dataframe-transform-code.png
│   │   ├── docs-dataframe-transform.gif
│   │   ├── docs-dataframe-transform.mp4
│   │   ├── docs-dataframe-transform.webm
│   │   ├── docs-dataframe-visualizations.png
│   │   ├── docs-debugging-minimap.mp4
│   │   ├── docs-debugging-minimap.webm
│   │   ├── docs-debugpy-edit-mode.webm
│   │   ├── docs-delete-cell.gif
│   │   ├── docs-delete-cell.mp4
│   │   ├── docs-delete-cell.webm
│   │   ├── docs-dependency-graph.png
│   │   ├── docs-df.gif
│   │   ├── docs-df.mp4
│   │   ├── docs-df.webm
│   │   ├── docs-disable-cell.gif
│   │   ├── docs-disable-cell.mp4
│   │   ├── docs-disable-cell.webm
│   │   ├── docs-enable-cell.gif
│   │   ├── docs-enable-cell.mp4
│   │   ├── docs-enable-cell.webm
│   │   ├── docs-feedback-form.png
│   │   ├── docs-html-export.png
│   │   ├── docs_import_star_error.png
│   │   ├── docs-intro-app.gif
│   │   ├── docs-intro-app.mp4
│   │   ├── docs-intro-app.webm
│   │   ├── docs-intro.gif
│   │   ├── docs-intro.mp4
│   │   ├── docs-intro.webm
│   │   ├── docs-lazy-execution.mp4
│   │   ├── docs-markdown-toggle.gif
│   │   ├── docs-markdown-toggle.mp4
│   │   ├── docs-markdown-toggle.webm
│   │   ├── docs-mcp-client-settings.png
│   │   ├── docs-mcp-server.mp4
│   │   ├── docs-model-comparison.gif
│   │   ├── docs-model-comparison.mp4
│   │   ├── docs-model-comparison.webm
│   │   ├── docs-module-reloading-lazy.mp4
│   │   ├── docs-module-reloading.mp4
│   │   ├── docs-multi-column.png
│   │   ├── docs-notebook-errors-context.png
│   │   ├── docs-notebook-settings-snapshotting.jpg
│   │   ├── docs-notebook-settings-snapshotting.webp
│   │   ├── docs-panel-drag-drop.webm
│   │   ├── docs-panel-icons.png
│   │   ├── docs-pdb-breakpoint.webm
│   │   ├── docs-pdb-demo.png
│   │   ├── docs-postmortem-debugging.webm
│   │   ├── docs-provider-config.png
│   │   ├── docs-reactive-reference-highlighting.jpg
│   │   ├── docs-reactive-reference-highlighting.webp
│   │   ├── docs_redefines_variables_error.png
│   │   ├── docs-remote-storage.mp4
│   │   ├── docs-row-viewer-panel.mp4
│   │   ├── docs-runtime-config.mp4
│   │   ├── docs-settings.png
│   │   ├── docs_setup_error.png
│   │   ├── docs-sidebar-developer-panel.jpg
│   │   ├── docs-sidebar-developer-panel.webp
│   │   ├── docs-signature-hint.png
│   │   ├── docs-sql-cell-demo.png
│   │   ├── docs-sql-choose-db.png
│   │   ├── docs-sql-datasources-panel.png
│   │   ├── docs-sql-df.png
│   │   ├── docs-sql-engine-dropdown.png
│   │   ├── docs-sql-format-icon.webp
│   │   ├── docs-sql-http.png
│   │   ├── docs-sql-linter.webp
│   │   ├── docs-sql-validate-mode.mp4
│   │   ├── docs-state-counter.gif
│   │   ├── docs-state-counter.mp4
│   │   ├── docs-state-counter.webm
│   │   ├── docs-state-task-list.gif
│   │   ├── docs-state-task-list.mp4
│   │   ├── docs-state-task-list.webm
│   │   ├── docs-state-tied.gif
│   │   ├── docs-state-tied.mp4
│   │   ├── docs-state-tied.webm
│   │   ├── docs-user-config.mp4
│   │   ├── docs-user-config.png
│   │   ├── embedding.gif
│   │   ├── embedding.mp4
│   │   ├── embedding.webm
│   │   ├── example-thumbs
│   │   │   ├── accordion.png
│   │   │   ├── admonitions.png
│   │   │   ├── altair.png
│   │   │   ├── array.png
│   │   │   ├── chat.png
│   │   │   ├── checkbox.png
│   │   │   ├── code_editor.png
│   │   │   ├── dataframes.png
│   │   │   ├── dataframe_transformer.png
│   │   │   ├── date.png
│   │   │   ├── details.png
│   │   │   ├── dictionary.png
│   │   │   ├── dropdown.png
│   │   │   ├── dynamic_markdown.png
│   │   │   ├── editable_dataframes.png
│   │   │   ├── file_upload.png
│   │   │   ├── form.png
│   │   │   ├── matrix.png
│   │   │   ├── mermaid.png
│   │   │   ├── microphone.png
│   │   │   ├── multiselect.png
│   │   │   ├── number.png
│   │   │   ├── plotly.png
│   │   │   ├── progress_bar.png
│   │   │   ├── radio.png
│   │   │   ├── run_button.png
│   │   │   ├── slider.png
│   │   │   ├── spinner.png
│   │   │   ├── stacks.png
│   │   │   ├── tables.png
│   │   │   ├── tabs.png
│   │   │   ├── text_area.png
│   │   │   └── text.png
│   │   ├── faq-marimo-ui.gif
│   │   ├── faq-marimo-ui.mp4
│   │   ├── faq-marimo-ui.webm
│   │   ├── favicon-32x32.png
│   │   ├── intro_condensed.gif
│   │   ├── intro_condensed.webm
│   │   ├── js
│   │   │   ├── analytics.js
│   │   │   ├── init_kapa_widget.js
│   │   │   └── math.js
│   │   ├── marimo-logotype-horizontal.png
│   │   ├── marimo-logotype-thick.svg
│   │   ├── motherduck
│   │   │   ├── motherduck_dag.png
│   │   │   ├── motherduck_db_discovery.png
│   │   │   ├── motherduck_python_and_sql.png
│   │   │   ├── motherduck_reactivity.mp4
│   │   │   └── motherduck_sql.png
│   │   ├── numfocus_affiliated_project.png
│   │   ├── outputs.gif
│   │   ├── outputs.mp4
│   │   ├── outputs.webm
│   │   ├── reactive.gif
│   │   ├── reactive.mp4
│   │   ├── reactive.webm
│   │   ├── readme-generate-with-ai.gif
│   │   ├── readme-generate-with-ai.mp4
│   │   ├── readme.gif
│   │   ├── readme.mp4
│   │   ├── readme-sql-cell.png
│   │   ├── readme-ui-form.gif
│   │   ├── readme-ui-form.mp4
│   │   ├── readme-ui-form.webm
│   │   ├── readme-ui.gif
│   │   ├── readme-ui.mp4
│   │   ├── readme-ui.webm
│   │   ├── readme.webm
│   │   ├── share-wasm-link.gif
│   │   ├── share-wasm-link.mp4
│   │   ├── share-wasm-link.webm
│   │   ├── vscode-marimo.png
│   │   ├── windsurf-api.png
│   │   └── windsurf-settings.png
│   ├── stylesheets
│   │   └── extra.css
│   └── vercel.json
├── examples
│   ├── ai
│   │   ├── chat
│   │   │   ├── anthropic_example.py
│   │   │   ├── bedrock_example.py
│   │   │   ├── custom.py
│   │   │   ├── dagger_code_interpreter.py
│   │   │   ├── deepseek_example.py
│   │   │   ├── gemini.py
│   │   │   ├── generative_ui.py
│   │   │   ├── groq_example.py
│   │   │   ├── llm_datasette.py
│   │   │   ├── mlx_chat.py
│   │   │   ├── openai_example.py
│   │   │   ├── pydantic-ai-chat.py
│   │   │   ├── README.md
│   │   │   ├── recipe_bot.py
│   │   │   ├── simplemind_example.py
│   │   │   └── streaming_custom.py
│   │   ├── data
│   │   │   ├── data_labeler.py
│   │   │   └── model_comparison.py
│   │   ├── misc
│   │   │   ├── build_a_superhero.py
│   │   │   ├── micrograd_mlp.py
│   │   │   └── pdf_question_answer.py
│   │   ├── README.md
│   │   └── tools
│   │       ├── chat_with_tools.py
│   │       ├── code_interpreter.py
│   │       ├── dataset_analysis.py
│   │       └── README.md
│   ├── cloud
│   │   ├── gcp
│   │   │   ├── google_cloud_bigquery.py
│   │   │   ├── google_cloud_storage.py
│   │   │   └── google_sheets.py
│   │   ├── modal
│   │   │   ├── modal_app.py
│   │   │   ├── modal_edit.py
│   │   │   ├── nbs
│   │   │   │   └── notebook.py
│   │   │   └── README.md
│   │   └── README.md
│   ├── control_flow
│   │   ├── README.md
│   │   └── stop_execution.py
│   ├── frameworks
│   │   ├── fastapi
│   │   │   ├── main.py
│   │   │   ├── README.md
│   │   │   └── templates
│   │   │       ├── home.html
│   │   │       └── login.html
│   │   ├── fastapi-endpoint
│   │   │   ├── main.py
│   │   │   ├── notebook.py
│   │   │   └── README.md
│   │   ├── fastapi-github
│   │   │   ├── main.py
│   │   │   ├── README.md
│   │   │   └── templates
│   │   │       └── home.html
│   │   ├── fasthtml
│   │   │   ├── main.py
│   │   │   └── README.md
│   │   ├── flask
│   │   │   ├── main.py
│   │   │   ├── README.md
│   │   │   └── templates
│   │   │       ├── error.html
│   │   │       ├── home.html
│   │   │       └── login.html
│   │   └── README.md
│   ├── layouts
│   │   ├── columns.py
│   │   ├── grid-dashboard.py
│   │   ├── layouts
│   │   │   ├── grid-dashboard.grid.json
│   │   │   └── slides.slides.json
│   │   ├── README.md
│   │   ├── sidebar.py
│   │   └── slides.py
│   ├── markdown
│   │   ├── admonitions.py
│   │   ├── details.py
│   │   ├── dynamic_markdown.py
│   │   ├── emoji.py
│   │   ├── mermaid.py
│   │   └── README.md
│   ├── misc
│   │   ├── bayes_theorem.py
│   │   ├── colliding_blocks_and_pi.py
│   │   ├── compound_interest.py
│   │   ├── create_your_own_shape.py
│   │   ├── custom_configuration.py
│   │   ├── explore_your_own_data.py
│   │   ├── filterable_table.py
│   │   ├── iss.py
│   │   ├── monotonic_splines.py
│   │   ├── mortgage_calculator.py
│   │   ├── movies_by_the_decade.py
│   │   ├── notebook_dir.py
│   │   ├── pokemon_stats.py
│   │   ├── public
│   │   │   └── marimos.webp
│   │   ├── public_folder.py
│   │   ├── reactive_plots.py
│   │   ├── README.md
│   │   ├── seam_carving.py
│   │   └── task_list.py
│   ├── outputs
│   │   ├── accordion.py
│   │   ├── audio.py
│   │   ├── basic_markdown.py
│   │   ├── capture_console_outputs.py
│   │   ├── cell_output.py
│   │   ├── conditional_output.py
│   │   ├── console_outputs.py
│   │   ├── dataframes.py
│   │   ├── plots.py
│   │   ├── progress_bar.py
│   │   ├── showing_multiple_outputs.py
│   │   ├── spinner.py
│   │   └── stacks.py
│   ├── README.md
│   ├── running_as_a_script
│   │   ├── sharing_arguments.py
│   │   ├── textual_app.py
│   │   ├── with_argparse.py
│   │   └── with_simple_parsing.py
│   ├── running_cells
│   │   ├── async_await.py
│   │   ├── basics.py
│   │   ├── debugging.py
│   │   ├── in_memory_cache.py
│   │   ├── multiple_definitions.py
│   │   └── persistent_cache.py
│   ├── sql
│   │   ├── connect_to_motherduck.py
│   │   ├── connect_to_persistent_db.py
│   │   ├── connect_to_postgres.py
│   │   ├── connect_to_sqlite.py
│   │   ├── duckdb_example.py
│   │   ├── histograms.py
│   │   ├── misc
│   │   │   ├── database_explorer.py
│   │   │   ├── electric_vehicles.py
│   │   │   ├── README.md
│   │   │   └── sql_cars.py
│   │   ├── parametrizing_sql_queries.py
│   │   ├── querying_dataframes.py
│   │   ├── read_csv.py
│   │   ├── read_json.py
│   │   ├── README.md
│   │   └── read_parquet.py
│   ├── storage
│   │   └── general.py
│   ├── testing
│   │   ├── README.md
│   │   ├── running_doctests.py
│   │   └── test_with_pytest.py
│   ├── third_party
│   │   ├── aframe
│   │   │   └── aframe_example.py
│   │   ├── anywidget
│   │   │   ├── reactive_quak.py
│   │   │   └── tldraw_colorpicker.py
│   │   ├── chroma
│   │   │   └── multimodal_retrieval.py
│   │   ├── cvxpy
│   │   │   ├── regularization_and_sparsity.py
│   │   │   ├── signals
│   │   │   │   ├── app.py
│   │   │   │   ├── assets
│   │   │   │   │   └── solar_power_soiling_reference.png
│   │   │   │   ├── examples.py
│   │   │   │   └── modules
│   │   │   │       ├── components.py
│   │   │   │       ├── dataloaders.py
│   │   │   │       ├── explainer.py
│   │   │   │       ├── __init__.py
│   │   │   │       ├── intro_problem.py
│   │   │   │       ├── layout.py
│   │   │   │       ├── problems.py
│   │   │   │       └── solutions.py
│   │   │   └── smallest_enclosing_circle.py
│   │   ├── databricks
│   │   │   └── databricks_connect.py
│   │   ├── duckdb
│   │   │   └── duckdb_example.py
│   │   ├── great_tables
│   │   │   ├── coffee-sales.json
│   │   │   └── great_tables_example.py
│   │   ├── huggingface
│   │   │   ├── chatbot.py
│   │   │   ├── README.md
│   │   │   └── text-to-image.py
│   │   ├── ibis
│   │   │   └── ibis_example.py
│   │   ├── leafmap
│   │   │   └── leafmap_example.py
│   │   ├── matplotlib
│   │   │   ├── mandelbrot.py
│   │   │   └── surfaces.py
│   │   ├── motherduck
│   │   │   └── embeddings
│   │   │       ├── embeddings_explorer_final.py
│   │   │       ├── embeddings_explorer.py
│   │   │       └── README.md
│   │   ├── nvidia
│   │   │   └── nims.py
│   │   ├── plotly
│   │   │   ├── area_chart.py
│   │   │   ├── bar_chart.py
│   │   │   ├── heatmap.py
│   │   │   ├── image_selection.py
│   │   │   ├── line_chart.py
│   │   │   ├── mapbox.py
│   │   │   └── scatter_map.py
│   │   ├── polars
│   │   │   └── polars_example.py
│   │   ├── pygwalker
│   │   │   └── example.py
│   │   ├── pyiceberg
│   │   │   └── data_catalog.py
│   │   ├── pymde
│   │   │   ├── complete_graph.py
│   │   │   ├── debugging_embeddings.py
│   │   │   ├── drawing_graphs.py
│   │   │   ├── embedding_numbers.py
│   │   │   ├── google_scholar.py
│   │   │   ├── interactive_cluster_analysis.py
│   │   │   ├── rotational_invariance.py
│   │   │   ├── tree.py
│   │   │   └── us_counties.py
│   │   ├── README.md
│   │   ├── sage
│   │   │   ├── chat_with_github_repo.py
│   │   │   ├── chat_with_sage.png
│   │   │   ├── continue_chatting_with_sage.png
│   │   │   └── README.md
│   │   ├── substrate
│   │   │   └── video_generation.py
│   │   └── unsloth
│   │       ├── llama_3_1_8b_2x_faster_finetuning.py
│   │       └── requirements.txt
│   └── ui
│       ├── array_element.py
│       ├── arrays_and_dicts.py
│       ├── batch_and_form.py
│       ├── batch.py
│       ├── button.py
│       ├── chat.py
│       ├── checkbox.py
│       ├── code_editor.py
│       ├── data_editor.py
│       ├── data_explorer.py
│       ├── dataframe.py
│       ├── date.py
│       ├── date_range.py
│       ├── datetime_input.py
│       ├── dictionary.py
│       ├── download.py
│       ├── dropdown.py
│       ├── file_browser.py
│       ├── file.py
│       ├── form.py
│       ├── image_comparison_demo.py
│       ├── layout.py
│       ├── matrix.py
│       ├── microphone.py
│       ├── multiselect.py
│       ├── number.py
│       ├── radio.py
│       ├── range_slider.py
│       ├── README.md
│       ├── refresh.py
│       ├── run_button.py
│       ├── slider.py
│       ├── switch.py
│       ├── table_advanced.py
│       ├── table.py
│       ├── tabs_advanced.py
│       ├── tabs.py
│       ├── text_area.py
│       └── text.py
├── frontend
│   ├── AGENTS.md
│   ├── benchmarks
│   │   ├── base64-conversion.bench.ts
│   │   └── uint8array-to-base64.bench.ts
│   ├── components.json
│   ├── df-conversion.py
│   ├── e2e-tests
│   │   ├── badButton.spec.ts
│   │   ├── bugs.spec.ts
│   │   ├── cells.spec.ts
│   │   ├── components.spec.ts
│   │   ├── disabled.spec.ts
│   │   ├── global-setup.ts
│   │   ├── global-teardown.ts
│   │   ├── helper.ts
│   │   ├── kitchen-sink.spec.ts
│   │   ├── kitchen-sink-wasm.spec.ts
│   │   ├── layout-grid.spec.ts
│   │   ├── layout-grid-with-sidebar.spec.ts
│   │   ├── mode.spec.ts
│   │   ├── output.spec.ts
│   │   ├── py
│   │   │   ├── bad_button.py
│   │   │   ├── bugs.py
│   │   │   ├── cells.py
│   │   │   ├── components.py
│   │   │   ├── disabled_cells.py
│   │   │   ├── kitchen_sink.py
│   │   │   ├── layout_grid_max_width.py
│   │   │   ├── layout_grid.py
│   │   │   ├── layout_grid_with_sidebar.py
│   │   │   ├── layouts
│   │   │   │   ├── layout_grid.grid.json
│   │   │   │   ├── layout_grid_max_width.grid.json
│   │   │   │   ├── layout_grid_with_sidebar.grid.json
│   │   │   │   └── slides.slides.json
│   │   │   ├── output.py
│   │   │   ├── shutdown.py
│   │   │   ├── slides.py
│   │   │   ├── stdin.py
│   │   │   ├── streams.py
│   │   │   └── title.py
│   │   ├── README.md
│   │   ├── screenshots
│   │   │   ├── slides.0.png
│   │   │   └── slides.1.png
│   │   ├── shutdown.spec.ts
│   │   ├── slides.spec.ts
│   │   ├── stdin.spec.ts
│   │   ├── streams.spec.ts
│   │   ├── test-utils.ts
│   │   ├── toggle-cell-language.spec.ts
│   │   └── tsconfig.json
│   ├── index.html
│   ├── islands
│   │   ├── __demo__
│   │   │   ├── index.html
│   │   │   └── output.html
│   │   ├── development.md
│   │   ├── generate.py
│   │   ├── validate.sh
│   │   └── vite.config.mts
│   ├── lint
│   │   ├── addEventListenerObject.grit
│   │   ├── atomWithStorageArgs.grit
│   │   ├── noCommentedConsole.grit
│   │   ├── preferObjectParams.grit
│   │   └── removeEventListenerObject.grit
│   ├── package.json
│   ├── playwright.config.ts
│   ├── postcss.config.cjs
│   ├── public
│   │   ├── android-chrome-192x192.png
│   │   ├── android-chrome-512x512.png
│   │   ├── apple-touch-icon.png
│   │   ├── favicon-16x16.png
│   │   ├── favicon-32x32.png
│   │   ├── favicon.ico
│   │   ├── files
│   │   │   └── wasm-intro.py
│   │   ├── logo.png
│   │   ├── manifest.json
│   │   └── site.webmanifest
│   ├── src
│   │   ├── assets
│   │   │   ├── circle-check.ico
│   │   │   ├── circle-play.ico
│   │   │   ├── circle-x.ico
│   │   │   ├── gradient.png
│   │   │   ├── icon-16x16.png
│   │   │   ├── icon-32x32.png
│   │   │   └── noise.png
│   │   ├── components
│   │   │   ├── ai
│   │   │   │   ├── ai-model-dropdown.tsx
│   │   │   │   ├── ai-provider-icon.tsx
│   │   │   │   ├── ai-utils.ts
│   │   │   │   ├── display-helpers.tsx
│   │   │   │   └── __tests__
│   │   │   │       └── ai-utils.test.ts
│   │   │   ├── app-config
│   │   │   │   ├── ai-config.tsx
│   │   │   │   ├── app-config-button.tsx
│   │   │   │   ├── app-config-form.tsx
│   │   │   │   ├── common.tsx
│   │   │   │   ├── constants.ts
│   │   │   │   ├── data-form.tsx
│   │   │   │   ├── incorrect-model-id.tsx
│   │   │   │   ├── is-overridden.tsx
│   │   │   │   ├── mcp-config.tsx
│   │   │   │   ├── optional-features.tsx
│   │   │   │   ├── state.ts
│   │   │   │   ├── __tests__
│   │   │   │   │   └── get-dirty-values.test.ts
│   │   │   │   └── user-config-form.tsx
│   │   │   ├── audio
│   │   │   │   └── audio-recorder.tsx
│   │   │   ├── buttons
│   │   │   │   ├── clear-button.tsx
│   │   │   │   └── undo-button.tsx
│   │   │   ├── charts
│   │   │   │   ├── lazy.tsx
│   │   │   │   ├── tooltip.ts
│   │   │   │   └── types.ts
│   │   │   ├── chat
│   │   │   │   ├── acp
│   │   │   │   │   ├── agent-docs.tsx
│   │   │   │   │   ├── agent-panel.css
│   │   │   │   │   ├── agent-panel.tsx
│   │   │   │   │   ├── agent-selector.tsx
│   │   │   │   │   ├── blocks.tsx
│   │   │   │   │   ├── common.tsx
│   │   │   │   │   ├── context-utils.ts
│   │   │   │   │   ├── model-selector.tsx
│   │   │   │   │   ├── prompt.ts
│   │   │   │   │   ├── scroll-to-bottom-button.tsx
│   │   │   │   │   ├── session-tabs.tsx
│   │   │   │   │   ├── state.ts
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   ├── atoms.test.ts
│   │   │   │   │   │   ├── context-utils.test.ts
│   │   │   │   │   │   ├── prompt.test.ts
│   │   │   │   │   │   ├── __snapshots__
│   │   │   │   │   │   │   └── prompt.test.ts.snap
│   │   │   │   │   │   └── state.test.ts
│   │   │   │   │   ├── thread.tsx
│   │   │   │   │   ├── types.ts
│   │   │   │   │   └── utils.ts
│   │   │   │   ├── chat-components.tsx
│   │   │   │   ├── chat-display.tsx
│   │   │   │   ├── chat-history-popover.tsx
│   │   │   │   ├── chat-history-utils.ts
│   │   │   │   ├── chat-panel.tsx
│   │   │   │   ├── chat-utils.ts
│   │   │   │   ├── reasoning-accordion.tsx
│   │   │   │   ├── __tests__
│   │   │   │   │   └── useFileState.test.tsx
│   │   │   │   └── tool-call-accordion.tsx
│   │   │   ├── databases
│   │   │   │   ├── display.tsx
│   │   │   │   ├── engine-variable.tsx
│   │   │   │   ├── icons
│   │   │   │   │   ├── clickhouse.svg
│   │   │   │   │   ├── databricks.svg
│   │   │   │   │   ├── datafusion.png
│   │   │   │   │   ├── duckdb.svg
│   │   │   │   │   ├── googlebigquery.svg
│   │   │   │   │   ├── google-cloud-storage.svg
│   │   │   │   │   ├── iceberg.png
│   │   │   │   │   ├── motherduck.svg
│   │   │   │   │   ├── mysql.svg
│   │   │   │   │   ├── postgresql.svg
│   │   │   │   │   ├── redshift.svg
│   │   │   │   │   ├── snowflake.svg
│   │   │   │   │   ├── spark.svg
│   │   │   │   │   ├── sqlalchemy.svg
│   │   │   │   │   ├── sqlite.svg
│   │   │   │   │   ├── supabase.svg
│   │   │   │   │   ├── timeplus.svg
│   │   │   │   │   └── trino.svg
│   │   │   │   ├── icon.tsx
│   │   │   │   └── namespace-icons.ts
│   │   │   ├── datasets
│   │   │   │   └── icons.tsx
│   │   │   ├── datasources
│   │   │   │   ├── column-preview.tsx
│   │   │   │   ├── components.tsx
│   │   │   │   ├── datasources.tsx
│   │   │   │   ├── install-package-button.tsx
│   │   │   │   ├── __tests__
│   │   │   │   │   ├── install-package-button.test.tsx
│   │   │   │   │   └── utils.test.ts
│   │   │   │   └── utils.ts
│   │   │   ├── data-table
│   │   │   │   ├── cell-hover-template
│   │   │   │   │   ├── feature.ts
│   │   │   │   │   └── types.ts
│   │   │   │   ├── cell-hover-text
│   │   │   │   │   ├── feature.ts
│   │   │   │   │   └── types.ts
│   │   │   │   ├── cell-selection
│   │   │   │   │   ├── feature.ts
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   └── feature.test.ts
│   │   │   │   │   └── types.ts
│   │   │   │   ├── cell-styling
│   │   │   │   │   ├── feature.ts
│   │   │   │   │   └── types.ts
│   │   │   │   ├── cell-utils.ts
│   │   │   │   ├── charts
│   │   │   │   │   ├── chart-spec
│   │   │   │   │   │   ├── altair-generator.ts
│   │   │   │   │   │   ├── encodings.ts
│   │   │   │   │   │   ├── spec.ts
│   │   │   │   │   │   ├── tooltips.ts
│   │   │   │   │   │   ├── types.ts
│   │   │   │   │   │   └── utils.ts
│   │   │   │   │   ├── charts.tsx
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── chart-items.tsx
│   │   │   │   │   │   ├── chart-states.tsx
│   │   │   │   │   │   ├── form-fields.tsx
│   │   │   │   │   │   └── layouts.tsx
│   │   │   │   │   ├── constants.ts
│   │   │   │   │   ├── context.ts
│   │   │   │   │   ├── forms
│   │   │   │   │   │   ├── common-chart.tsx
│   │   │   │   │   │   ├── heatmap.tsx
│   │   │   │   │   │   └── pie.tsx
│   │   │   │   │   ├── lazy-chart.tsx
│   │   │   │   │   ├── README.md
│   │   │   │   │   ├── schemas.ts
│   │   │   │   │   ├── storage.ts
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   ├── altair-generator.test.ts
│   │   │   │   │   │   ├── renderer.test.ts
│   │   │   │   │   │   ├── __snapshots__
│   │   │   │   │   │   │   └── spec-snapshot.test.ts.snap
│   │   │   │   │   │   ├── spec-snapshot.test.ts
│   │   │   │   │   │   ├── spec.test.ts
│   │   │   │   │   │   └── storage.test.ts
│   │   │   │   │   └── types.ts
│   │   │   │   ├── column-explorer-panel
│   │   │   │   │   └── column-explorer.tsx
│   │   │   │   ├── column-formatting
│   │   │   │   │   ├── feature.ts
│   │   │   │   │   └── types.ts
│   │   │   │   ├── column-header.tsx
│   │   │   │   ├── columns.tsx
│   │   │   │   ├── column-summary
│   │   │   │   │   ├── chart-skeleton.tsx
│   │   │   │   │   ├── chart-spec-model.tsx
│   │   │   │   │   ├── column-summary.tsx
│   │   │   │   │   ├── legacy-chart-spec.ts
│   │   │   │   │   └── utils.ts
│   │   │   │   ├── column-wrapping
│   │   │   │   │   ├── feature.ts
│   │   │   │   │   └── types.ts
│   │   │   │   ├── context-menu.tsx
│   │   │   │   ├── copy-column
│   │   │   │   │   ├── feature.ts
│   │   │   │   │   └── types.ts
│   │   │   │   ├── data-table.tsx
│   │   │   │   ├── date-popover.tsx
│   │   │   │   ├── download-actions.tsx
│   │   │   │   ├── filter-pills.tsx
│   │   │   │   ├── filters.ts
│   │   │   │   ├── focus-row
│   │   │   │   │   ├── feature.ts
│   │   │   │   │   └── types.ts
│   │   │   │   ├── header-items.tsx
│   │   │   │   ├── hooks
│   │   │   │   │   ├── use-column-pinning.ts
│   │   │   │   │   └── use-panel-ownership.ts
│   │   │   │   ├── loading-table.tsx
│   │   │   │   ├── mime-cell.tsx
│   │   │   │   ├── pagination.tsx
│   │   │   │   ├── range-focus
│   │   │   │   │   ├── atoms.ts
│   │   │   │   │   ├── cell-selection-indicator.tsx
│   │   │   │   │   ├── cell-selection-stats.tsx
│   │   │   │   │   ├── provider.tsx
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   ├── atoms.test.ts
│   │   │   │   │   │   ├── cell-selection-stats.test.tsx
│   │   │   │   │   │   ├── test-utils.ts
│   │   │   │   │   │   └── utils.test.ts
│   │   │   │   │   ├── use-cell-range-selection.ts
│   │   │   │   │   ├── use-scroll-into-view.ts
│   │   │   │   │   └── utils.ts
│   │   │   │   ├── renderers.tsx
│   │   │   │   ├── row-viewer-panel
│   │   │   │   │   ├── row-viewer.tsx
│   │   │   │   │   └── __tests__
│   │   │   │   │       ├── filter-rows.test.ts
│   │   │   │   │       └── row-viewer.test.tsx
│   │   │   │   ├── schemas.ts
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── TableActions.tsx
│   │   │   │   ├── __tests__
│   │   │   │   │   ├── chart-spec-model.test.ts
│   │   │   │   │   ├── column_formatting.test.ts
│   │   │   │   │   ├── columns.test.tsx
│   │   │   │   │   ├── data-table.test.tsx
│   │   │   │   │   ├── header-items.test.tsx
│   │   │   │   │   ├── pagination.test.tsx
│   │   │   │   │   ├── __snapshots__
│   │   │   │   │   │   └── chart-spec-model.test.ts.snap
│   │   │   │   │   ├── types.test.ts
│   │   │   │   │   ├── url-detector.test.tsx
│   │   │   │   │   ├── useColumnPinning.test.ts
│   │   │   │   │   └── utils.test.ts
│   │   │   │   ├── types.ts
│   │   │   │   ├── uniformSample.tsx
│   │   │   │   ├── url-detector.tsx
│   │   │   │   └── utils.ts
│   │   │   ├── debug
│   │   │   │   └── indicator.tsx
│   │   │   ├── debugger
│   │   │   │   ├── debugger-code.css
│   │   │   │   ├── debugger-code.tsx
│   │   │   │   └── __tests__
│   │   │   │       └── debugger-code.test.tsx
│   │   │   ├── dependency-graph
│   │   │   │   ├── custom-node.tsx
│   │   │   │   ├── dependency-graph.css
│   │   │   │   ├── dependency-graph-tree.tsx
│   │   │   │   ├── dependency-graph.tsx
│   │   │   │   ├── elements.ts
│   │   │   │   ├── minimap-content.tsx
│   │   │   │   ├── panels.tsx
│   │   │   │   ├── types.ts
│   │   │   │   └── utils
│   │   │   │       ├── cell-preview.ts
│   │   │   │       ├── changes.ts
│   │   │   │       ├── layout.ts
│   │   │   │       ├── __tests__
│   │   │   │       │   └── cell-preview.test.ts
│   │   │   │       └── useFitToViewOnDimensionChange.ts
│   │   │   ├── editor
│   │   │   │   ├── actions
│   │   │   │   │   ├── name-cell-input.tsx
│   │   │   │   │   ├── types.ts
│   │   │   │   │   ├── useCellActionButton.tsx
│   │   │   │   │   ├── useConfigActions.tsx
│   │   │   │   │   ├── useCopyNotebook.tsx
│   │   │   │   │   ├── useHideAllMarkdownCode.ts
│   │   │   │   │   ├── useNotebookActions.tsx
│   │   │   │   │   └── useRestartKernel.tsx
│   │   │   │   ├── ai
│   │   │   │   │   ├── add-cell-with-ai.tsx
│   │   │   │   │   ├── ai-completion-editor.tsx
│   │   │   │   │   ├── completion-handlers.tsx
│   │   │   │   │   ├── completion-utils.ts
│   │   │   │   │   ├── merge-editor.css
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   └── completion-utils.test.ts
│   │   │   │   │   └── transport
│   │   │   │   │       └── chat-transport.tsx
│   │   │   │   ├── alerts
│   │   │   │   │   ├── connecting-alert.tsx
│   │   │   │   │   ├── floating-alert.tsx
│   │   │   │   │   ├── startup-logs-alert.tsx
│   │   │   │   │   └── stdin-blocking-alert.tsx
│   │   │   │   ├── app-container.tsx
│   │   │   │   ├── boundary
│   │   │   │   │   └── ErrorBoundary.tsx
│   │   │   │   ├── cell
│   │   │   │   │   ├── cell-actions.tsx
│   │   │   │   │   ├── cell-context-menu.tsx
│   │   │   │   │   ├── cell-status.css
│   │   │   │   │   ├── CellStatus.tsx
│   │   │   │   │   ├── code
│   │   │   │   │   │   ├── cell-editor.tsx
│   │   │   │   │   │   ├── icons.tsx
│   │   │   │   │   │   └── language-toggle.tsx
│   │   │   │   │   ├── collapse.tsx
│   │   │   │   │   ├── CreateCellButton.tsx
│   │   │   │   │   ├── DeleteButton.tsx
│   │   │   │   │   ├── PendingDeleteConfirmation.tsx
│   │   │   │   │   ├── RunButton.tsx
│   │   │   │   │   ├── StagedAICell.tsx
│   │   │   │   │   ├── StopButton.tsx
│   │   │   │   │   ├── TinyCode.css
│   │   │   │   │   ├── TinyCode.tsx
│   │   │   │   │   ├── toolbar.tsx
│   │   │   │   │   ├── useAddCell.ts
│   │   │   │   │   ├── useDeleteCell.tsx
│   │   │   │   │   ├── useRunCells.ts
│   │   │   │   │   ├── useShouldShowInterrupt.ts
│   │   │   │   │   └── useSplitCell.tsx
│   │   │   │   ├── chrome
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── contribute-snippet-button.tsx
│   │   │   │   │   │   └── feedback-button.tsx
│   │   │   │   │   ├── panels
│   │   │   │   │   │   ├── cache-panel.tsx
│   │   │   │   │   │   ├── components.tsx
│   │   │   │   │   │   ├── context-aware-panel
│   │   │   │   │   │   │   ├── atoms.ts
│   │   │   │   │   │   │   └── context-aware-panel.tsx
│   │   │   │   │   │   ├── datasources-panel.tsx
│   │   │   │   │   │   ├── dependency-graph-panel.tsx
│   │   │   │   │   │   ├── documentation-panel.tsx
│   │   │   │   │   │   ├── empty-state.tsx
│   │   │   │   │   │   ├── error-panel.tsx
│   │   │   │   │   │   ├── file-explorer-panel.tsx
│   │   │   │   │   │   ├── logs-panel.tsx
│   │   │   │   │   │   ├── outline
│   │   │   │   │   │   │   ├── floating-outline.tsx
│   │   │   │   │   │   │   └── useActiveOutline.tsx
│   │   │   │   │   │   ├── outline-panel.css
│   │   │   │   │   │   ├── outline-panel.tsx
│   │   │   │   │   │   ├── packages-panel.tsx
│   │   │   │   │   │   ├── packages-utils.ts
│   │   │   │   │   │   ├── panel-context.tsx
│   │   │   │   │   │   ├── scratchpad-panel.tsx
│   │   │   │   │   │   ├── secrets-panel.tsx
│   │   │   │   │   │   ├── session-panel.tsx
│   │   │   │   │   │   ├── snippets-panel.css
│   │   │   │   │   │   ├── snippets-panel.tsx
│   │   │   │   │   │   ├── __tests__
│   │   │   │   │   │   │   └── write-secret-modal.test.ts
│   │   │   │   │   │   ├── tracing-panel.tsx
│   │   │   │   │   │   ├── variable-panel.tsx
│   │   │   │   │   │   └── write-secret-modal.tsx
│   │   │   │   │   ├── state.ts
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   └── state.test.ts
│   │   │   │   │   ├── types.ts
│   │   │   │   │   └── wrapper
│   │   │   │   │       ├── app-chrome.css
│   │   │   │   │       ├── app-chrome.tsx
│   │   │   │   │       ├── footer-items
│   │   │   │   │       │   ├── ai-status.tsx
│   │   │   │   │       │   ├── backend-status.tsx
│   │   │   │   │       │   ├── copilot-status.tsx
│   │   │   │   │       │   ├── lsp-status.tsx
│   │   │   │   │       │   ├── machine-stats.tsx
│   │   │   │   │       │   ├── rtc-status.tsx
│   │   │   │   │       │   └── runtime-settings.tsx
│   │   │   │   │       ├── footer-item.tsx
│   │   │   │   │       ├── footer.tsx
│   │   │   │   │       ├── minimap-state.ts
│   │   │   │   │       ├── panels.tsx
│   │   │   │   │       ├── pending-ai-cells.tsx
│   │   │   │   │       ├── sidebar.tsx
│   │   │   │   │       ├── storage.ts
│   │   │   │   │       ├── __tests__
│   │   │   │   │       │   ├── minimap-state.test.ts
│   │   │   │   │       │   └── storage.test.ts
│   │   │   │   │       ├── useAiPanel.ts
│   │   │   │   │       ├── useDependencyPanelTab.ts
│   │   │   │   │       └── utils.ts
│   │   │   │   ├── code
│   │   │   │   │   ├── readonly-diff.tsx
│   │   │   │   │   └── readonly-python-code.tsx
│   │   │   │   ├── columns
│   │   │   │   │   ├── cell-column.tsx
│   │   │   │   │   ├── sortable-column.tsx
│   │   │   │   │   ├── storage.ts
│   │   │   │   │   └── __tests__
│   │   │   │   │       └── storage.test.ts
│   │   │   │   ├── common.ts
│   │   │   │   ├── controls
│   │   │   │   │   ├── command-palette-button.tsx
│   │   │   │   │   ├── command-palette.tsx
│   │   │   │   │   ├── Controls.tsx
│   │   │   │   │   ├── duplicate-shortcut-banner.tsx
│   │   │   │   │   ├── keyboard-shortcuts.tsx
│   │   │   │   │   ├── notebook-menu-dropdown.tsx
│   │   │   │   │   ├── shutdown-button.tsx
│   │   │   │   │   └── state.ts
│   │   │   │   ├── database
│   │   │   │   │   ├── add-database-form.tsx
│   │   │   │   │   ├── as-code.ts
│   │   │   │   │   ├── form-renderers.tsx
│   │   │   │   │   ├── schemas.ts
│   │   │   │   │   ├── secrets.ts
│   │   │   │   │   └── __tests__
│   │   │   │   │       ├── as-code.test.ts
│   │   │   │   │       ├── secrets.test.ts
│   │   │   │   │       └── __snapshots__
│   │   │   │   │           └── as-code.test.ts.snap
│   │   │   │   ├── Disconnected.tsx
│   │   │   │   ├── documentation.css
│   │   │   │   ├── dynamic-favicon.tsx
│   │   │   │   ├── errors
│   │   │   │   │   ├── auto-fix.tsx
│   │   │   │   │   ├── fix-mode.ts
│   │   │   │   │   └── sql-validation-errors.tsx
│   │   │   │   ├── file-tree
│   │   │   │   │   ├── dnd-wrapper.tsx
│   │   │   │   │   ├── file-explorer.tsx
│   │   │   │   │   ├── file-viewer.tsx
│   │   │   │   │   ├── renderers.tsx
│   │   │   │   │   ├── requesting-tree.tsx
│   │   │   │   │   ├── state.tsx
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   ├── file-explorer.test.ts
│   │   │   │   │   │   └── requesting-tree.test.ts
│   │   │   │   │   ├── types.ts
│   │   │   │   │   └── upload.tsx
│   │   │   │   ├── header
│   │   │   │   │   ├── app-header.tsx
│   │   │   │   │   ├── filename-form.tsx
│   │   │   │   │   ├── filename-input.css
│   │   │   │   │   ├── filename-input.tsx
│   │   │   │   │   ├── status.tsx
│   │   │   │   │   └── __tests__
│   │   │   │   │       └── filename-form.test.tsx
│   │   │   │   ├── inputs
│   │   │   │   │   ├── Inputs.css
│   │   │   │   │   ├── Inputs.styles.ts
│   │   │   │   │   └── Inputs.tsx
│   │   │   │   ├── KernelStartupErrorModal.tsx
│   │   │   │   ├── kiosk-mode.tsx
│   │   │   │   ├── links
│   │   │   │   │   ├── cell-link-list.tsx
│   │   │   │   │   └── cell-link.tsx
│   │   │   │   ├── navigation
│   │   │   │   │   ├── clipboard.ts
│   │   │   │   │   ├── focus-utils.ts
│   │   │   │   │   ├── multi-cell-action-toolbar.tsx
│   │   │   │   │   ├── navigation.ts
│   │   │   │   │   ├── selection.ts
│   │   │   │   │   ├── state.ts
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   ├── clipboard.test.ts
│   │   │   │   │   │   ├── focus-utils.test.ts
│   │   │   │   │   │   ├── navigation.test.ts
│   │   │   │   │   │   ├── selection.test.ts
│   │   │   │   │   │   └── state.test.ts
│   │   │   │   │   ├── vim-bindings.test.ts
│   │   │   │   │   └── vim-bindings.ts
│   │   │   │   ├── notebook-banner.tsx
│   │   │   │   ├── notebook-cell.tsx
│   │   │   │   ├── output
│   │   │   │   │   ├── ansi-reduce.ts
│   │   │   │   │   ├── CalloutOutput.styles.ts
│   │   │   │   │   ├── CalloutOutput.tsx
│   │   │   │   │   ├── console
│   │   │   │   │   │   ├── ConsoleOutput.tsx
│   │   │   │   │   │   ├── process-output.ts
│   │   │   │   │   │   ├── __tests__
│   │   │   │   │   │   │   ├── ConsoleOutput.test.tsx
│   │   │   │   │   │   │   └── text-rendering.test.tsx
│   │   │   │   │   │   └── text-rendering.tsx
│   │   │   │   │   ├── EmotionCacheProvider.tsx
│   │   │   │   │   ├── HtmlOutput.tsx
│   │   │   │   │   ├── ImageOutput.tsx
│   │   │   │   │   ├── JsonOutput.tsx
│   │   │   │   │   ├── MarimoErrorOutput.tsx
│   │   │   │   │   ├── MarimoTracebackOutput.tsx
│   │   │   │   │   ├── Outputs.css
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   ├── ansi-reduce.test.ts
│   │   │   │   │   │   ├── ansi.test.ts
│   │   │   │   │   │   ├── HtmlOutput.test.tsx
│   │   │   │   │   │   ├── JsonOutput-mimetype.test.tsx
│   │   │   │   │   │   ├── json-output.test.ts
│   │   │   │   │   │   └── traceback.test.tsx
│   │   │   │   │   ├── TextOutput.tsx
│   │   │   │   │   ├── useWrapText.ts
│   │   │   │   │   └── VideoOutput.tsx
│   │   │   │   ├── Output.tsx
│   │   │   │   ├── package-alert.tsx
│   │   │   │   ├── RecoveryButton.tsx
│   │   │   │   ├── renderers
│   │   │   │   │   ├── cell-array.tsx
│   │   │   │   │   ├── cells-renderer.tsx
│   │   │   │   │   ├── grid-layout
│   │   │   │   │   │   ├── grid-layout.tsx
│   │   │   │   │   │   ├── plugin.tsx
│   │   │   │   │   │   ├── styles.css
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── layout-select.tsx
│   │   │   │   │   ├── plugins.ts
│   │   │   │   │   ├── slides-layout
│   │   │   │   │   │   ├── plugin.tsx
│   │   │   │   │   │   ├── slides-layout.tsx
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── types.ts
│   │   │   │   │   └── vertical-layout
│   │   │   │   │       ├── sidebar
│   │   │   │   │       │   ├── sheet-sidebar.tsx
│   │   │   │   │       │   ├── sidebar.css
│   │   │   │   │       │   ├── sidebar-slot.tsx
│   │   │   │   │       │   ├── sidebar.tsx
│   │   │   │   │       │   ├── state.ts
│   │   │   │   │       │   ├── __tests__
│   │   │   │   │       │   │   └── sidebar.test.tsx
│   │   │   │   │       │   ├── toggle.tsx
│   │   │   │   │       │   └── wrapped-with-sidebar.tsx
│   │   │   │   │       ├── __tests__
│   │   │   │   │       │   ├── useDelayVisibility.test.ts
│   │   │   │   │       │   ├── useFocusFirstEditor.test.ts
│   │   │   │   │       │   └── vertical-layout.test.ts
│   │   │   │   │       ├── useDelayVisibility.ts
│   │   │   │   │       ├── useFocusFirstEditor.ts
│   │   │   │   │       ├── vertical-layout.tsx
│   │   │   │   │       └── vertical-layout-wrapper.tsx
│   │   │   │   ├── renderMimeIcon.tsx
│   │   │   │   ├── SortableCell.tsx
│   │   │   │   ├── stdin-blocking-alert.tsx
│   │   │   │   └── __tests__
│   │   │   │       ├── data-attributes.test.tsx
│   │   │   │       ├── dynamic-favicon.test.tsx
│   │   │   │       └── Output.test.tsx
│   │   │   ├── find-replace
│   │   │   │   └── find-replace.tsx
│   │   │   ├── forms
│   │   │   │   ├── form.tsx
│   │   │   │   ├── form-utils.ts
│   │   │   │   ├── options.ts
│   │   │   │   ├── switchable-multi-select.tsx
│   │   │   │   └── __tests__
│   │   │   │       └── form-utils.test.ts
│   │   │   ├── home
│   │   │   │   ├── components.tsx
│   │   │   │   └── state.ts
│   │   │   ├── icons
│   │   │   │   ├── copy-icon.tsx
│   │   │   │   ├── github-copilot.tsx
│   │   │   │   ├── large-spinner.tsx
│   │   │   │   ├── loading-ellipsis.tsx
│   │   │   │   ├── multi-icon.css
│   │   │   │   ├── multi-icon.tsx
│   │   │   │   └── spinner.tsx
│   │   │   ├── layout
│   │   │   │   └── toolbar.tsx
│   │   │   ├── markdown
│   │   │   │   ├── markdown-renderer.css
│   │   │   │   └── markdown-renderer.tsx
│   │   │   ├── mcp
│   │   │   │   ├── hooks.ts
│   │   │   │   └── mcp-status-indicator.tsx
│   │   │   ├── modal
│   │   │   │   └── ImperativeModal.tsx
│   │   │   ├── pages
│   │   │   │   ├── edit-page.tsx
│   │   │   │   ├── gallery-page.tsx
│   │   │   │   ├── home-page.tsx
│   │   │   │   └── run-page.tsx
│   │   │   ├── scratchpad
│   │   │   │   ├── scratchpad-history.ts
│   │   │   │   └── scratchpad.tsx
│   │   │   ├── shortcuts
│   │   │   │   └── renderShortcut.tsx
│   │   │   ├── slides
│   │   │   │   ├── slides-component.tsx
│   │   │   │   └── slides.css
│   │   │   ├── sort
│   │   │   │   └── SortableCellsProvider.tsx
│   │   │   ├── static-html
│   │   │   │   ├── share-modal.tsx
│   │   │   │   └── static-banner.tsx
│   │   │   ├── storage
│   │   │   │   ├── components.tsx
│   │   │   │   └── storage-inspector.tsx
│   │   │   ├── terminal
│   │   │   │   ├── hooks.ts
│   │   │   │   ├── state.ts
│   │   │   │   ├── terminal.tsx
│   │   │   │   ├── __tests__
│   │   │   │   │   └── state.test.ts
│   │   │   │   ├── theme.tsx
│   │   │   │   └── xterm.css
│   │   │   ├── tracing
│   │   │   │   ├── tracing-spec.ts
│   │   │   │   ├── tracing.test.tsx
│   │   │   │   ├── tracing.tsx
│   │   │   │   └── utils.ts
│   │   │   ├── ui
│   │   │   │   ├── accordion.tsx
│   │   │   │   ├── alert-dialog.tsx
│   │   │   │   ├── alert.tsx
│   │   │   │   ├── aria-popover.tsx
│   │   │   │   ├── badge.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── calendar.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── checkbox.tsx
│   │   │   │   ├── combobox.tsx
│   │   │   │   ├── command.tsx
│   │   │   │   ├── confirmation-button.tsx
│   │   │   │   ├── context-menu.tsx
│   │   │   │   ├── date-input.tsx
│   │   │   │   ├── date-picker.tsx
│   │   │   │   ├── dialog.tsx
│   │   │   │   ├── draggable-popover.tsx
│   │   │   │   ├── dropdown-menu.tsx
│   │   │   │   ├── field.tsx
│   │   │   │   ├── form.tsx
│   │   │   │   ├── fullscreen.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── kbd.tsx
│   │   │   │   ├── label.tsx
│   │   │   │   ├── links.tsx
│   │   │   │   ├── menu-items.tsx
│   │   │   │   ├── native-select.tsx
│   │   │   │   ├── navigation.tsx
│   │   │   │   ├── number-field.tsx
│   │   │   │   ├── popover.tsx
│   │   │   │   ├── progress.tsx
│   │   │   │   ├── query-param-preserving-link.tsx
│   │   │   │   ├── radio-group.tsx
│   │   │   │   ├── range-slider.tsx
│   │   │   │   ├── reorderable-list.css
│   │   │   │   ├── reorderable-list.tsx
│   │   │   │   ├── scroll-area.tsx
│   │   │   │   ├── select.tsx
│   │   │   │   ├── sheet.tsx
│   │   │   │   ├── skeleton.tsx
│   │   │   │   ├── slider.tsx
│   │   │   │   ├── switch.tsx
│   │   │   │   ├── table.tsx
│   │   │   │   ├── tabs.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── toaster.tsx
│   │   │   │   ├── toast.tsx
│   │   │   │   ├── toggle.tsx
│   │   │   │   ├── tooltip.tsx
│   │   │   │   ├── typography.tsx
│   │   │   │   ├── use-restore-focus.ts
│   │   │   │   └── use-toast.ts
│   │   │   ├── utils
│   │   │   │   ├── delay-mount.tsx
│   │   │   │   └── lazy-mount.tsx
│   │   │   └── variables
│   │   │       ├── common.tsx
│   │   │       └── variables-table.tsx
│   │   ├── core
│   │   │   ├── ai
│   │   │   │   ├── chat-utils.ts
│   │   │   │   ├── config.ts
│   │   │   │   ├── context
│   │   │   │   │   ├── context.ts
│   │   │   │   │   ├── providers
│   │   │   │   │   │   ├── cell-output.ts
│   │   │   │   │   │   ├── common.ts
│   │   │   │   │   │   ├── datasource.ts
│   │   │   │   │   │   ├── error.ts
│   │   │   │   │   │   ├── file.ts
│   │   │   │   │   │   ├── tables.ts
│   │   │   │   │   │   ├── __tests__
│   │   │   │   │   │   │   ├── cell-output.test.ts
│   │   │   │   │   │   │   ├── datasource.test.ts
│   │   │   │   │   │   │   ├── error.test.ts
│   │   │   │   │   │   │   ├── file.test.ts
│   │   │   │   │   │   │   ├── __snapshots__
│   │   │   │   │   │   │   │   ├── cell-output.test.ts.snap
│   │   │   │   │   │   │   │   ├── datasource.test.ts.snap
│   │   │   │   │   │   │   │   ├── error.test.ts.snap
│   │   │   │   │   │   │   │   ├── tables.test.ts.snap
│   │   │   │   │   │   │   │   └── variable.test.ts.snap
│   │   │   │   │   │   │   ├── tables.test.ts
│   │   │   │   │   │   │   └── variable.test.ts
│   │   │   │   │   │   └── variable.ts
│   │   │   │   │   ├── registry.ts
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   ├── registry.test.ts
│   │   │   │   │   │   └── utils.test.ts
│   │   │   │   │   └── utils.ts
│   │   │   │   ├── ids
│   │   │   │   │   ├── ids.ts
│   │   │   │   │   └── __tests__
│   │   │   │   │       └── ids.test.ts
│   │   │   │   ├── model-registry.ts
│   │   │   │   ├── staged-cells.ts
│   │   │   │   ├── state.ts
│   │   │   │   ├── __tests__
│   │   │   │   │   ├── model-registry.test.ts
│   │   │   │   │   └── staged-cells.test.ts
│   │   │   │   └── tools
│   │   │   │       ├── base.ts
│   │   │   │       ├── edit-notebook-tool.ts
│   │   │   │       ├── registry.ts
│   │   │   │       ├── run-cells-tool.ts
│   │   │   │       ├── sample-tool.ts
│   │   │   │       ├── __tests__
│   │   │   │       │   ├── edit-notebook-tool.test.ts
│   │   │   │       │   ├── registry.test.ts
│   │   │   │       │   ├── run-cells-tool.test.ts
│   │   │   │       │   └── utils.test.ts
│   │   │   │       └── utils.ts
│   │   │   ├── alerts
│   │   │   │   └── state.ts
│   │   │   ├── cache
│   │   │   │   └── requests.ts
│   │   │   ├── cells
│   │   │   │   ├── actions.ts
│   │   │   │   ├── add-missing-import.ts
│   │   │   │   ├── cells.ts
│   │   │   │   ├── cell.ts
│   │   │   │   ├── collapseConsoleOutputs.tsx
│   │   │   │   ├── effects.ts
│   │   │   │   ├── focus.ts
│   │   │   │   ├── ids.ts
│   │   │   │   ├── logs.ts
│   │   │   │   ├── names.ts
│   │   │   │   ├── outline.ts
│   │   │   │   ├── outputs.ts
│   │   │   │   ├── pending-delete-service.ts
│   │   │   │   ├── runs.ts
│   │   │   │   ├── scrollCellIntoView.ts
│   │   │   │   ├── session.ts
│   │   │   │   ├── __tests__
│   │   │   │   │   ├── add-missing-import.test.ts
│   │   │   │   │   ├── cells.test.ts
│   │   │   │   │   ├── cell.test.ts
│   │   │   │   │   ├── collapseConsoleOutputs.test.ts
│   │   │   │   │   ├── focus.test.ts
│   │   │   │   │   ├── ids.test.ts
│   │   │   │   │   ├── logs.test.ts
│   │   │   │   │   ├── names.test.ts
│   │   │   │   │   ├── pending-delete-service.test.tsx
│   │   │   │   │   ├── runs.test.ts
│   │   │   │   │   ├── scrollCellIntoView.test.ts
│   │   │   │   │   ├── session.test.ts
│   │   │   │   │   ├── __snapshots__
│   │   │   │   │   │   └── cells.test.ts.snap
│   │   │   │   │   └── utils.test.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── utils.ts
│   │   │   ├── codemirror
│   │   │   │   ├── ai
│   │   │   │   │   ├── request.ts
│   │   │   │   │   ├── resources.ts
│   │   │   │   │   └── state.ts
│   │   │   │   ├── cells
│   │   │   │   │   ├── extensions.ts
│   │   │   │   │   ├── state.ts
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   └── traceback-decorations.test.ts
│   │   │   │   │   └── traceback-decorations.ts
│   │   │   │   ├── cm.ts
│   │   │   │   ├── compat
│   │   │   │   │   ├── jupyter.tsx
│   │   │   │   │   └── __tests__
│   │   │   │   │       └── jupyter.test.ts
│   │   │   │   ├── completion
│   │   │   │   │   ├── Autocompleter.ts
│   │   │   │   │   ├── completer.ts
│   │   │   │   │   ├── hints.ts
│   │   │   │   │   ├── keymap.ts
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   ├── hints.test.ts
│   │   │   │   │   │   └── keymap.test.ts
│   │   │   │   │   ├── utils.ts
│   │   │   │   │   └── variable-completions.ts
│   │   │   │   ├── config
│   │   │   │   │   ├── extension.ts
│   │   │   │   │   └── types.ts
│   │   │   │   ├── copilot
│   │   │   │   │   ├── client.ts
│   │   │   │   │   ├── copilot-config.tsx
│   │   │   │   │   ├── extension.ts
│   │   │   │   │   ├── getCodes.ts
│   │   │   │   │   ├── language-server.ts
│   │   │   │   │   ├── state.ts
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   ├── copilot.test.ts
│   │   │   │   │   │   ├── getCodes.test.ts
│   │   │   │   │   │   ├── language-server.test.ts
│   │   │   │   │   │   ├── transport.test.ts
│   │   │   │   │   │   └── trim-utils.test.ts
│   │   │   │   │   ├── transport.ts
│   │   │   │   │   ├── trim-utils.ts
│   │   │   │   │   └── types.ts
│   │   │   │   ├── editing
│   │   │   │   │   ├── commands.ts
│   │   │   │   │   ├── debugging.ts
│   │   │   │   │   ├── extensions.ts
│   │   │   │   │   └── __tests__
│   │   │   │   │       ├── commands.test.ts
│   │   │   │   │       └── debugging.test.ts
│   │   │   │   ├── extensions.ts
│   │   │   │   ├── facet.ts
│   │   │   │   ├── find-replace
│   │   │   │   │   ├── extension.ts
│   │   │   │   │   ├── navigate.ts
│   │   │   │   │   ├── query.ts
│   │   │   │   │   ├── search-highlight.ts
│   │   │   │   │   ├── state.ts
│   │   │   │   │   └── __tests__
│   │   │   │   │       └── navigate.test.ts
│   │   │   │   ├── format.ts
│   │   │   │   ├── go-to-definition
│   │   │   │   │   ├── commands.ts
│   │   │   │   │   ├── extension.ts
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   └── commands.test.ts
│   │   │   │   │   ├── underline.ts
│   │   │   │   │   └── utils.ts
│   │   │   │   ├── keymaps
│   │   │   │   │   ├── keymaps.ts
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   ├── keymaps.test.ts
│   │   │   │   │   │   └── vimrc.test.ts
│   │   │   │   │   ├── vimrc.ts
│   │   │   │   │   └── vim.ts
│   │   │   │   ├── language
│   │   │   │   │   ├── commands.ts
│   │   │   │   │   ├── embedded
│   │   │   │   │   │   ├── embedded-python.ts
│   │   │   │   │   │   ├── latex.ts
│   │   │   │   │   │   └── __tests__
│   │   │   │   │   │       └── embedded-python.test.ts
│   │   │   │   │   ├── extension.ts
│   │   │   │   │   ├── LanguageAdapters.ts
│   │   │   │   │   ├── languages
│   │   │   │   │   │   ├── markdown.ts
│   │   │   │   │   │   ├── python.ts
│   │   │   │   │   │   └── sql
│   │   │   │   │   │       ├── banner-validation-errors.ts
│   │   │   │   │   │       ├── completion-builder.ts
│   │   │   │   │   │       ├── completion-sources.tsx
│   │   │   │   │   │       ├── completion-store.ts
│   │   │   │   │   │       ├── renderers.tsx
│   │   │   │   │   │       ├── sql-mode.ts
│   │   │   │   │   │       ├── sql.ts
│   │   │   │   │   │       └── utils.ts
│   │   │   │   │   ├── metadata.ts
│   │   │   │   │   ├── panel
│   │   │   │   │   │   ├── markdown.tsx
│   │   │   │   │   │   ├── panel.tsx
│   │   │   │   │   │   └── sql.tsx
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   ├── extension.test.ts
│   │   │   │   │   │   ├── indentOneTab.test.ts
│   │   │   │   │   │   ├── markdown.test.ts
│   │   │   │   │   │   ├── sql.test.ts
│   │   │   │   │   │   ├── sql-validation.test.ts
│   │   │   │   │   │   └── utils.test.ts
│   │   │   │   │   ├── types.ts
│   │   │   │   │   ├── utils
│   │   │   │   │   │   └── indentOneTab.ts
│   │   │   │   │   └── utils.ts
│   │   │   │   ├── lsp
│   │   │   │   │   ├── federated-lsp.ts
│   │   │   │   │   ├── lens.ts
│   │   │   │   │   ├── normalize-markdown-math.ts
│   │   │   │   │   ├── notebook-lsp.ts
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   ├── normalize-markdown-math.test.ts
│   │   │   │   │   │   └── notebook-lsp.test.ts
│   │   │   │   │   ├── transports.ts
│   │   │   │   │   ├── types.ts
│   │   │   │   │   └── utils.ts
│   │   │   │   ├── markdown
│   │   │   │   │   ├── commands.ts
│   │   │   │   │   ├── completions.ts
│   │   │   │   │   ├── extension.ts
│   │   │   │   │   └── __tests__
│   │   │   │   │       └── commands.test.ts
│   │   │   │   ├── misc
│   │   │   │   │   ├── dnd.ts
│   │   │   │   │   ├── paste.ts
│   │   │   │   │   ├── string-braces.ts
│   │   │   │   │   └── __tests__
│   │   │   │   │       ├── dnd.test.ts
│   │   │   │   │       ├── paste.test.ts
│   │   │   │   │       └── string-braces.test.ts
│   │   │   │   ├── placeholder
│   │   │   │   │   ├── extensions.ts
│   │   │   │   │   └── __tests__
│   │   │   │   │       └── extensions.test.ts
│   │   │   │   ├── react-dom
│   │   │   │   │   └── createPanel.tsx
│   │   │   │   ├── reactive-references
│   │   │   │   │   ├── analyzer.ts
│   │   │   │   │   ├── extension.ts
│   │   │   │   │   └── __tests__
│   │   │   │   │       └── analyzer.test.ts
│   │   │   │   ├── readonly
│   │   │   │   │   ├── extension.ts
│   │   │   │   │   └── __tests__
│   │   │   │   │       └── extension.test.ts
│   │   │   │   ├── replace-editor-content.ts
│   │   │   │   ├── rtc
│   │   │   │   │   ├── extension.ts
│   │   │   │   │   └── loro
│   │   │   │   │       ├── awareness.ts
│   │   │   │   │       ├── colors.ts
│   │   │   │   │       └── sync.ts
│   │   │   │   ├── __tests__
│   │   │   │   │   ├── extensions.test.ts
│   │   │   │   │   ├── format.test.ts
│   │   │   │   │   ├── replace-editor-content.test.ts
│   │   │   │   │   ├── setup.test.ts
│   │   │   │   │   └── __snapshots__
│   │   │   │   │       └── setup.test.ts.snap
│   │   │   │   ├── theme
│   │   │   │   │   ├── dark.ts
│   │   │   │   │   ├── light.ts
│   │   │   │   │   └── __tests__
│   │   │   │   │       └── light.test.ts
│   │   │   │   ├── types.ts
│   │   │   │   ├── utils.ts
│   │   │   │   └── vim
│   │   │   │       └── cursor-visibility.ts
│   │   │   ├── config
│   │   │   │   ├── capabilities.ts
│   │   │   │   ├── config-schema.ts
│   │   │   │   ├── config.ts
│   │   │   │   ├── feature-flag.tsx
│   │   │   │   ├── if-capability.tsx
│   │   │   │   ├── __tests__
│   │   │   │   │   └── config-schema.test.ts
│   │   │   │   └── widths.ts
│   │   │   ├── constants.ts
│   │   │   ├── datasets
│   │   │   │   ├── data-source-connections.ts
│   │   │   │   ├── engines.ts
│   │   │   │   ├── request-registry.ts
│   │   │   │   ├── state.ts
│   │   │   │   ├── __tests__
│   │   │   │   │   ├── all-tables.test.ts
│   │   │   │   │   └── data-source.test.ts
│   │   │   │   └── types.ts
│   │   │   ├── debugger
│   │   │   │   └── state.ts
│   │   │   ├── documentation
│   │   │   │   ├── DocHoverTarget.tsx
│   │   │   │   ├── doc-lookup.ts
│   │   │   │   └── state.ts
│   │   │   ├── dom
│   │   │   │   ├── defineCustomElement.ts
│   │   │   │   ├── events.ts
│   │   │   │   ├── htmlUtils.ts
│   │   │   │   ├── outline.ts
│   │   │   │   ├── __tests__
│   │   │   │   │   ├── htmlUtils.test.ts
│   │   │   │   │   └── outline.test.ts
│   │   │   │   ├── ui-element.css
│   │   │   │   ├── ui-element.ts
│   │   │   │   └── uiregistry.ts
│   │   │   ├── edit-app.tsx
│   │   │   ├── errors
│   │   │   │   ├── errors.ts
│   │   │   │   ├── state.ts
│   │   │   │   ├── __tests__
│   │   │   │   │   ├── errors.test.ts
│   │   │   │   │   └── utils.test.ts
│   │   │   │   └── utils.ts
│   │   │   ├── export
│   │   │   │   ├── hooks.ts
│   │   │   │   └── __tests__
│   │   │   │       └── hooks.test.ts
│   │   │   ├── functions
│   │   │   │   └── FunctionRegistry.ts
│   │   │   ├── hotkeys
│   │   │   │   ├── actions.ts
│   │   │   │   ├── hotkeys.ts
│   │   │   │   ├── shortcuts.ts
│   │   │   │   └── __tests__
│   │   │   │       ├── hotkeys.test.ts
│   │   │   │       └── shortcuts.test.ts
│   │   │   ├── i18n
│   │   │   │   ├── locale-provider.tsx
│   │   │   │   ├── __tests__
│   │   │   │   │   └── locale-provider.test.tsx
│   │   │   │   └── with-locale.tsx
│   │   │   ├── islands
│   │   │   │   ├── bridge.ts
│   │   │   │   ├── components
│   │   │   │   │   ├── output-wrapper.tsx
│   │   │   │   │   └── web-components.tsx
│   │   │   │   ├── islands.css
│   │   │   │   ├── main.ts
│   │   │   │   ├── parse.ts
│   │   │   │   ├── state.ts
│   │   │   │   ├── __tests__
│   │   │   │   │   ├── bridge.test.ts
│   │   │   │   │   └── parse.test.ts
│   │   │   │   ├── toast.ts
│   │   │   │   ├── utils.ts
│   │   │   │   └── worker
│   │   │   │       ├── controller.ts
│   │   │   │       └── worker.tsx
│   │   │   ├── kernel
│   │   │   │   ├── handlers.ts
│   │   │   │   ├── messages.ts
│   │   │   │   ├── queryParamHandlers.ts
│   │   │   │   ├── RuntimeState.ts
│   │   │   │   ├── session.ts
│   │   │   │   ├── state.ts
│   │   │   │   └── __tests__
│   │   │   │       ├── handlers.test.ts
│   │   │   │       ├── RuntimeState.test.ts
│   │   │   │       └── session.test.ts
│   │   │   ├── layout
│   │   │   │   ├── layout.ts
│   │   │   │   └── useTogglePresenting.ts
│   │   │   ├── lsp
│   │   │   │   ├── __tests__
│   │   │   │   │   └── transport.test.ts
│   │   │   │   └── transport.ts
│   │   │   ├── MarimoApp.tsx
│   │   │   ├── meta
│   │   │   │   ├── globals.ts
│   │   │   │   └── state.ts
│   │   │   ├── mime.ts
│   │   │   ├── mode.ts
│   │   │   ├── network
│   │   │   │   ├── api.ts
│   │   │   │   ├── auth.ts
│   │   │   │   ├── CachingRequestRegistry.ts
│   │   │   │   ├── connection.ts
│   │   │   │   ├── DeferredRequestRegistry.ts
│   │   │   │   ├── requests-lazy.ts
│   │   │   │   ├── requests-network.ts
│   │   │   │   ├── requests-static.ts
│   │   │   │   ├── requests-toasting.tsx
│   │   │   │   ├── requests.ts
│   │   │   │   ├── resolve.ts
│   │   │   │   ├── __tests__
│   │   │   │   │   ├── api.test.ts
│   │   │   │   │   ├── CachingRequestRegistry.test.ts
│   │   │   │   │   ├── DeferredRequestRegistry.test.ts
│   │   │   │   │   ├── requests-lazy.test.ts
│   │   │   │   │   └── requests-network.test.ts
│   │   │   │   └── types.ts
│   │   │   ├── packages
│   │   │   │   ├── package-input-utils.ts
│   │   │   │   ├── __tests__
│   │   │   │   │   └── package-input-utils.test.ts
│   │   │   │   ├── toast-components.tsx
│   │   │   │   └── useInstallPackage.ts
│   │   │   ├── rtc
│   │   │   │   └── state.ts
│   │   │   ├── run-app.tsx
│   │   │   ├── runtime
│   │   │   │   ├── config.ts
│   │   │   │   ├── runtime.ts
│   │   │   │   ├── __tests__
│   │   │   │   │   ├── config.test.ts
│   │   │   │   │   ├── createWsUrl.test.ts
│   │   │   │   │   └── runtime.test.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── utils.ts
│   │   │   ├── saving
│   │   │   │   ├── filename.ts
│   │   │   │   ├── file-state.ts
│   │   │   │   ├── save-component.tsx
│   │   │   │   ├── state.ts
│   │   │   │   ├── __tests__
│   │   │   │   │   ├── filename.test.ts
│   │   │   │   │   └── save-component.test.ts
│   │   │   │   └── useAutoSave.ts
│   │   │   ├── secrets
│   │   │   │   └── request-registry.ts
│   │   │   ├── slots
│   │   │   │   └── slots.ts
│   │   │   ├── state
│   │   │   │   ├── jotai.ts
│   │   │   │   ├── __mocks__
│   │   │   │   │   └── mocks.ts
│   │   │   │   ├── observable.ts
│   │   │   │   └── __tests__
│   │   │   │       └── jotai.test.ts
│   │   │   ├── static
│   │   │   │   ├── download-html.ts
│   │   │   │   ├── files.ts
│   │   │   │   ├── static-state.ts
│   │   │   │   ├── __tests__
│   │   │   │   │   ├── download-html.test.ts
│   │   │   │   │   ├── files.test.ts
│   │   │   │   │   └── virtual-file-tracker.test.ts
│   │   │   │   ├── types.ts
│   │   │   │   └── virtual-file-tracker.ts
│   │   │   ├── storage
│   │   │   │   ├── request-registry.ts
│   │   │   │   ├── state.ts
│   │   │   │   ├── __tests__
│   │   │   │   │   ├── state.test.ts
│   │   │   │   │   ├── types.test.ts
│   │   │   │   │   └── useStorageEntries.test.tsx
│   │   │   │   └── types.ts
│   │   │   ├── variables
│   │   │   │   ├── state.ts
│   │   │   │   ├── __tests__
│   │   │   │   │   └── state.test.ts
│   │   │   │   └── types.ts
│   │   │   ├── vscode
│   │   │   │   ├── is-in-vscode.ts
│   │   │   │   └── vscode-bindings.ts
│   │   │   ├── wasm
│   │   │   │   ├── bridge.ts
│   │   │   │   ├── PyodideLoader.tsx
│   │   │   │   ├── router.ts
│   │   │   │   ├── rpc.ts
│   │   │   │   ├── share.ts
│   │   │   │   ├── state.ts
│   │   │   │   ├── store.ts
│   │   │   │   ├── __tests__
│   │   │   │   │   ├── router.test.ts
│   │   │   │   │   ├── share.test.ts
│   │   │   │   │   ├── state.test.ts
│   │   │   │   │   └── store.test.ts
│   │   │   │   ├── utils.ts
│   │   │   │   └── worker
│   │   │   │       ├── bootstrap.ts
│   │   │   │       ├── constants.ts
│   │   │   │       ├── fs.ts
│   │   │   │       ├── getController.ts
│   │   │   │       ├── getFS.ts
│   │   │   │       ├── getMarimoWheel.ts
│   │   │   │       ├── getPyodideVersion.ts
│   │   │   │       ├── message-buffer.ts
│   │   │   │       ├── save-worker.ts
│   │   │   │       ├── tracer.ts
│   │   │   │       ├── types.ts
│   │   │   │       └── worker.ts
│   │   │   └── websocket
│   │   │       ├── connection-utils.ts
│   │   │       ├── transports
│   │   │       │   ├── basic.ts
│   │   │       │   ├── __tests__
│   │   │       │   │   ├── basic.test.ts
│   │   │       │   │   └── transport.test.ts
│   │   │       │   └── transport.ts
│   │   │       ├── types.ts
│   │   │       ├── useMarimoKernelConnection.tsx
│   │   │       └── useWebSocket.tsx
│   │   ├── css
│   │   │   ├── admonition.css
│   │   │   ├── app
│   │   │   │   ├── App.css
│   │   │   │   ├── Cell.css
│   │   │   │   ├── codemirror-completions.css
│   │   │   │   ├── codemirror.css
│   │   │   │   ├── fonts.css
│   │   │   │   ├── Header.css
│   │   │   │   ├── print.css
│   │   │   │   └── reset.css
│   │   │   ├── codehilite.css
│   │   │   ├── common.css
│   │   │   ├── globals.css
│   │   │   ├── index.css
│   │   │   ├── katex-fonts.css
│   │   │   ├── katex.min.css
│   │   │   ├── md.css
│   │   │   ├── md-tooltip.css
│   │   │   ├── progress.css
│   │   │   └── table.css
│   │   ├── custom.d.ts
│   │   ├── fonts
│   │   │   ├── Fira_Mono
│   │   │   │   ├── FiraMono-Bold.ttf
│   │   │   │   ├── FiraMono-Medium.ttf
│   │   │   │   └── FiraMono-Regular.ttf
│   │   │   ├── KaTeX
│   │   │   │   ├── KaTeX_AMS-Regular.ttf
│   │   │   │   ├── KaTeX_AMS-Regular.woff
│   │   │   │   ├── KaTeX_AMS-Regular.woff2
│   │   │   │   ├── KaTeX_Caligraphic-Bold.ttf
│   │   │   │   ├── KaTeX_Caligraphic-Bold.woff
│   │   │   │   ├── KaTeX_Caligraphic-Bold.woff2
│   │   │   │   ├── KaTeX_Caligraphic-Regular.ttf
│   │   │   │   ├── KaTeX_Caligraphic-Regular.woff
│   │   │   │   ├── KaTeX_Caligraphic-Regular.woff2
│   │   │   │   ├── KaTeX_Fraktur-Bold.ttf
│   │   │   │   ├── KaTeX_Fraktur-Bold.woff
│   │   │   │   ├── KaTeX_Fraktur-Bold.woff2
│   │   │   │   ├── KaTeX_Fraktur-Regular.ttf
│   │   │   │   ├── KaTeX_Fraktur-Regular.woff
│   │   │   │   ├── KaTeX_Fraktur-Regular.woff2
│   │   │   │   ├── KaTeX_Main-BoldItalic.ttf
│   │   │   │   ├── KaTeX_Main-BoldItalic.woff
│   │   │   │   ├── KaTeX_Main-BoldItalic.woff2
│   │   │   │   ├── KaTeX_Main-Bold.ttf
│   │   │   │   ├── KaTeX_Main-Bold.woff
│   │   │   │   ├── KaTeX_Main-Bold.woff2
│   │   │   │   ├── KaTeX_Main-Italic.ttf
│   │   │   │   ├── KaTeX_Main-Italic.woff
│   │   │   │   ├── KaTeX_Main-Italic.woff2
│   │   │   │   ├── KaTeX_Main-Regular.ttf
│   │   │   │   ├── KaTeX_Main-Regular.woff
│   │   │   │   ├── KaTeX_Main-Regular.woff2
│   │   │   │   ├── KaTeX_Math-BoldItalic.ttf
│   │   │   │   ├── KaTeX_Math-BoldItalic.woff
│   │   │   │   ├── KaTeX_Math-BoldItalic.woff2
│   │   │   │   ├── KaTeX_Math-Italic.ttf
│   │   │   │   ├── KaTeX_Math-Italic.woff
│   │   │   │   ├── KaTeX_Math-Italic.woff2
│   │   │   │   ├── KaTeX_SansSerif-Bold.ttf
│   │   │   │   ├── KaTeX_SansSerif-Bold.woff
│   │   │   │   ├── KaTeX_SansSerif-Bold.woff2
│   │   │   │   ├── KaTeX_SansSerif-Italic.ttf
│   │   │   │   ├── KaTeX_SansSerif-Italic.woff
│   │   │   │   ├── KaTeX_SansSerif-Italic.woff2
│   │   │   │   ├── KaTeX_SansSerif-Regular.ttf
│   │   │   │   ├── KaTeX_SansSerif-Regular.woff
│   │   │   │   ├── KaTeX_SansSerif-Regular.woff2
│   │   │   │   ├── KaTeX_Script-Regular.ttf
│   │   │   │   ├── KaTeX_Script-Regular.woff
│   │   │   │   ├── KaTeX_Script-Regular.woff2
│   │   │   │   ├── KaTeX_Size1-Regular.ttf
│   │   │   │   ├── KaTeX_Size1-Regular.woff
│   │   │   │   ├── KaTeX_Size1-Regular.woff2
│   │   │   │   ├── KaTeX_Size2-Regular.ttf
│   │   │   │   ├── KaTeX_Size2-Regular.woff
│   │   │   │   ├── KaTeX_Size2-Regular.woff2
│   │   │   │   ├── KaTeX_Size3-Regular.ttf
│   │   │   │   ├── KaTeX_Size3-Regular.woff
│   │   │   │   ├── KaTeX_Size3-Regular.woff2
│   │   │   │   ├── KaTeX_Size4-Regular.ttf
│   │   │   │   ├── KaTeX_Size4-Regular.woff
│   │   │   │   ├── KaTeX_Size4-Regular.woff2
│   │   │   │   ├── KaTeX_Typewriter-Regular.ttf
│   │   │   │   ├── KaTeX_Typewriter-Regular.woff
│   │   │   │   └── KaTeX_Typewriter-Regular.woff2
│   │   │   ├── Lora
│   │   │   │   ├── Lora-Italic-VariableFont_wght.ttf
│   │   │   │   ├── Lora-VariableFont_wght.ttf
│   │   │   │   └── static
│   │   │   │       ├── Lora-BoldItalic.ttf
│   │   │   │       ├── Lora-Bold.ttf
│   │   │   │       ├── Lora-Italic.ttf
│   │   │   │       ├── Lora-MediumItalic.ttf
│   │   │   │       ├── Lora-Medium.ttf
│   │   │   │       ├── Lora-Regular.ttf
│   │   │   │       ├── Lora-SemiBoldItalic.ttf
│   │   │   │       └── Lora-SemiBold.ttf
│   │   │   └── PT_Sans
│   │   │       ├── PTSans-BoldItalic.ttf
│   │   │       ├── PTSans-Bold.ttf
│   │   │       ├── PTSans-Italic.ttf
│   │   │       └── PTSans-Regular.ttf
│   │   ├── hooks
│   │   │   ├── debug.ts
│   │   │   ├── __tests__
│   │   │   │   ├── useBoolean.test.tsx
│   │   │   │   ├── useDebounce.test.tsx
│   │   │   │   ├── useDuplicateShortcuts.test.ts
│   │   │   │   ├── useEffectSkipFirstRender.test.tsx
│   │   │   │   ├── useEventListener.test.tsx
│   │   │   │   ├── useInputHistory.test.tsx
│   │   │   │   ├── useInternalStateWithSync.test.tsx
│   │   │   │   ├── useInterval.test.tsx
│   │   │   │   ├── useNonce.test.tsx
│   │   │   │   ├── useOverflowDetection.test.tsx
│   │   │   │   ├── usePackageMetadata.test.tsx
│   │   │   │   ├── useResizeHandle.test.tsx
│   │   │   │   ├── useResizeObserver.test.tsx
│   │   │   │   └── useTimer.test.tsx
│   │   │   ├── useAsyncData.ts
│   │   │   ├── useAudioRecorder.ts
│   │   │   ├── useAutoGrowInputProps.ts
│   │   │   ├── useBoolean.ts
│   │   │   ├── useCellRenderCount.ts
│   │   │   ├── useDebounce.ts
│   │   │   ├── useDeepCompareMemoize.ts
│   │   │   ├── useDuplicateShortcuts.ts
│   │   │   ├── useEffectSkipFirstRender.ts
│   │   │   ├── useElapsedTime.ts
│   │   │   ├── useEventListener.ts
│   │   │   ├── useEvent.ts
│   │   │   ├── useFormatting.ts
│   │   │   ├── useHotkey.ts
│   │   │   ├── useIframeCapabilities.ts
│   │   │   ├── useInputHistory.ts
│   │   │   ├── useInternalStateWithSync.ts
│   │   │   ├── useInterval.ts
│   │   │   ├── useIsDragging.tsx
│   │   │   ├── useLifecycle.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useNonce.ts
│   │   │   ├── useOverflowDetection.ts
│   │   │   ├── usePackageMetadata.ts
│   │   │   ├── useRecentCommands.ts
│   │   │   ├── useResizeHandle.ts
│   │   │   ├── useResizeObserver.ts
│   │   │   ├── useScript.ts
│   │   │   ├── useSelectAllContent.ts
│   │   │   └── useTimer.ts
│   │   ├── main.tsx
│   │   ├── __mocks__
│   │   │   ├── common.ts
│   │   │   ├── notebook.ts
│   │   │   ├── requests.ts
│   │   │   └── tracebacks.ts
│   │   ├── mount.tsx
│   │   ├── plugins
│   │   │   ├── core
│   │   │   │   ├── BadPlugin.tsx
│   │   │   │   ├── builder.ts
│   │   │   │   ├── registerReactComponent.tsx
│   │   │   │   ├── RenderHTML.tsx
│   │   │   │   ├── rpc.ts
│   │   │   │   ├── sanitize.ts
│   │   │   │   ├── sidebar-element.tsx
│   │   │   │   └── __test__
│   │   │   │       ├── registerReactComponent.test.ts
│   │   │   │       ├── renderHTML-sanitization.test.tsx
│   │   │   │       ├── RenderHTML.test.ts
│   │   │   │       └── sanitize.test.ts
│   │   │   ├── impl
│   │   │   │   ├── anywidget
│   │   │   │   │   ├── AnyWidgetPlugin.tsx
│   │   │   │   │   ├── model.ts
│   │   │   │   │   ├── schemas.ts
│   │   │   │   │   ├── serialization.ts
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   ├── AnyWidgetPlugin.test.tsx
│   │   │   │   │   │   ├── model.test.ts
│   │   │   │   │   │   ├── serialization.test.ts
│   │   │   │   │   │   └── widget-binding.test.ts
│   │   │   │   │   ├── types.ts
│   │   │   │   │   └── widget-binding.ts
│   │   │   │   ├── ButtonPlugin.tsx
│   │   │   │   ├── chat
│   │   │   │   │   ├── ChatPlugin.tsx
│   │   │   │   │   ├── chat-ui.tsx
│   │   │   │   │   └── types.ts
│   │   │   │   ├── CheckboxPlugin.tsx
│   │   │   │   ├── code
│   │   │   │   │   ├── any-language-editor.tsx
│   │   │   │   │   ├── LazyAnyLanguageCodeMirror.tsx
│   │   │   │   │   └── __tests__
│   │   │   │   │       └── language.test.ts
│   │   │   │   ├── CodeEditorPlugin.tsx
│   │   │   │   ├── common
│   │   │   │   │   ├── error-banner.tsx
│   │   │   │   │   ├── intent.ts
│   │   │   │   │   └── labeled.tsx
│   │   │   │   ├── data-editor
│   │   │   │   │   ├── components.tsx
│   │   │   │   │   ├── data-utils.ts
│   │   │   │   │   ├── glide-data-editor.tsx
│   │   │   │   │   ├── glide-utils.ts
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   ├── data-utils.test.ts
│   │   │   │   │   │   └── glide-utils.test.ts
│   │   │   │   │   ├── themes.ts
│   │   │   │   │   └── types.ts
│   │   │   │   ├── DataEditorPlugin.tsx
│   │   │   │   ├── data-explorer
│   │   │   │   │   ├── components
│   │   │   │   │   │   ├── column-summary.tsx
│   │   │   │   │   │   ├── icons.tsx
│   │   │   │   │   │   └── query-form.tsx
│   │   │   │   │   ├── ConnectedDataExplorerComponent.tsx
│   │   │   │   │   ├── DataExplorerPlugin.tsx
│   │   │   │   │   ├── encoding.ts
│   │   │   │   │   ├── functions
│   │   │   │   │   │   ├── function.ts
│   │   │   │   │   │   └── types.ts
│   │   │   │   │   ├── marks.ts
│   │   │   │   │   ├── queries
│   │   │   │   │   │   ├── field-suggestion.ts
│   │   │   │   │   │   ├── histograms.ts
│   │   │   │   │   │   ├── queries.ts
│   │   │   │   │   │   ├── removeUndefined.ts
│   │   │   │   │   │   ├── types.ts
│   │   │   │   │   │   └── utils.ts
│   │   │   │   │   ├── spec.ts
│   │   │   │   │   └── state
│   │   │   │   │       ├── reducer.ts
│   │   │   │   │       └── types.ts
│   │   │   │   ├── data-frames
│   │   │   │   │   ├── DataFramePlugin.tsx
│   │   │   │   │   ├── forms
│   │   │   │   │   │   ├── context.ts
│   │   │   │   │   │   ├── datatype-icon.tsx
│   │   │   │   │   │   ├── renderers.tsx
│   │   │   │   │   │   └── __tests__
│   │   │   │   │   │       ├── form.test.tsx
│   │   │   │   │   │       └── __snapshots__
│   │   │   │   │   │           └── form.test.tsx.snap
│   │   │   │   │   ├── panel.tsx
│   │   │   │   │   ├── schema.ts
│   │   │   │   │   ├── types.ts
│   │   │   │   │   └── utils
│   │   │   │   │       ├── getEffectiveColumns.ts
│   │   │   │   │       ├── operators.ts
│   │   │   │   │       └── __tests__
│   │   │   │   │           ├── getEffectiveColumns.test.ts
│   │   │   │   │           └── operators.test.ts
│   │   │   │   ├── DataTablePlugin.tsx
│   │   │   │   ├── DatePickerPlugin.tsx
│   │   │   │   ├── DateRangePlugin.tsx
│   │   │   │   ├── DateTimePickerPlugin.tsx
│   │   │   │   ├── DictPlugin.tsx
│   │   │   │   ├── DropdownPlugin.tsx
│   │   │   │   ├── FileBrowserPlugin.tsx
│   │   │   │   ├── FileUploadPlugin.tsx
│   │   │   │   ├── FormPlugin.tsx
│   │   │   │   ├── image-comparison
│   │   │   │   │   └── ImageComparisonComponent.tsx
│   │   │   │   ├── matplotlib
│   │   │   │   │   ├── MatplotlibPlugin.tsx
│   │   │   │   │   ├── matplotlib-renderer.ts
│   │   │   │   │   └── __tests__
│   │   │   │   │       └── matplotlib-renderer.test.ts
│   │   │   │   ├── matrix.css
│   │   │   │   ├── MatrixPlugin.tsx
│   │   │   │   ├── MicrophonePlugin.tsx
│   │   │   │   ├── multiselectFilterFn.tsx
│   │   │   │   ├── MultiselectPlugin.tsx
│   │   │   │   ├── NumberPlugin.tsx
│   │   │   │   ├── panel
│   │   │   │   │   ├── PanelPlugin.tsx
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   └── utils.test.ts
│   │   │   │   │   └── utils.ts
│   │   │   │   ├── plotly
│   │   │   │   │   ├── mapbox.css
│   │   │   │   │   ├── parse-from-template.ts
│   │   │   │   │   ├── plotly.css
│   │   │   │   │   ├── PlotlyPlugin.tsx
│   │   │   │   │   ├── Plot.tsx
│   │   │   │   │   ├── __tests__
│   │   │   │   │   │   ├── parse-from-template.test.ts
│   │   │   │   │   │   └── usePlotlyLayout.test.ts
│   │   │   │   │   └── usePlotlyLayout.ts
│   │   │   │   ├── RadioPlugin.tsx
│   │   │   │   ├── RangeSliderPlugin.tsx
│   │   │   │   ├── RefreshPlugin.tsx
│   │   │   │   ├── SearchableSelect.tsx
│   │   │   │   ├── SliderPlugin.tsx
│   │   │   │   ├── SwitchPlugin.tsx
│   │   │   │   ├── TabsPlugin.tsx
│   │   │   │   ├── __tests__
│   │   │   │   │   ├── DataTablePlugin.test.tsx
│   │   │   │   │   ├── DateTimePickerPlugin.test.tsx
│   │   │   │   │   ├── DropdownPlugin.test.tsx
│   │   │   │   │   ├── MatrixPlugin.test.tsx
│   │   │   │   │   ├── MultiSelectPlugin.test.ts
│   │   │   │   │   └── NumberPlugin.test.tsx
│   │   │   │   ├── TextAreaPlugin.tsx
│   │   │   │   ├── TextInputPlugin.tsx
│   │   │   │   └── vega
│   │   │   │       ├── batched.ts
│   │   │   │       ├── encodings.ts
│   │   │   │       ├── fix-relative-url.ts
│   │   │   │       ├── formats.ts
│   │   │   │       ├── loader.ts
│   │   │   │       ├── make-selectable.ts
│   │   │   │       ├── marks.ts
│   │   │   │       ├── params.ts
│   │   │   │       ├── resolve-data.ts
│   │   │   │       ├── __tests__
│   │   │   │       │   ├── encodings.test.ts
│   │   │   │       │   ├── loader.test.ts
│   │   │   │       │   ├── make-selectable.test.ts
│   │   │   │       │   ├── params.test.ts
│   │   │   │       │   ├── resolve-data.test.ts
│   │   │   │       │   ├── __snapshots__
│   │   │   │       │   │   └── make-selectable.test.ts.snap
│   │   │   │       │   └── vega.test.ts
│   │   │   │       ├── types.ts
│   │   │   │       ├── utils.ts
│   │   │   │       ├── vega-component.tsx
│   │   │   │       ├── vega.css
│   │   │   │       ├── vega-loader.ts
│   │   │   │       └── VegaPlugin.tsx
│   │   │   ├── layout
│   │   │   │   ├── AccordionPlugin.tsx
│   │   │   │   ├── CalloutPlugin.tsx
│   │   │   │   ├── carousel
│   │   │   │   │   └── CarouselPlugin.tsx
│   │   │   │   ├── DownloadPlugin.tsx
│   │   │   │   ├── ImageComparisonPlugin.tsx
│   │   │   │   ├── JsonOutputPlugin.tsx
│   │   │   │   ├── LazyPlugin.tsx
│   │   │   │   ├── mermaid
│   │   │   │   │   ├── MermaidPlugin.tsx
│   │   │   │   │   └── mermaid.tsx
│   │   │   │   ├── MimeRenderPlugin.tsx
│   │   │   │   ├── navigation-menu.css
│   │   │   │   ├── NavigationMenuPlugin.tsx
│   │   │   │   ├── OutlinePlugin.tsx
│   │   │   │   ├── ProgressPlugin.tsx
│   │   │   │   ├── RoutesPlugin.tsx
│   │   │   │   ├── StatPlugin.tsx
│   │   │   │   ├── __test__
│   │   │   │   │   └── ProgressPlugin.test.ts
│   │   │   │   └── TexPlugin.tsx
│   │   │   ├── plugins.ts
│   │   │   ├── stateless-plugin.ts
│   │   │   └── types.ts
│   │   ├── README.md
│   │   ├── stories
│   │   │   ├── accordion.stories.tsx
│   │   │   ├── alert-dialog.mdx
│   │   │   ├── app-chrome.stories.tsx
│   │   │   ├── button.stories.tsx
│   │   │   ├── callout.stories.tsx
│   │   │   ├── cell-status.stories.tsx
│   │   │   ├── cell.stories.tsx
│   │   │   ├── checkbox.stories.tsx
│   │   │   ├── colors.stories.tsx
│   │   │   ├── combobox.stories.tsx
│   │   │   ├── context-menu.mdx
│   │   │   ├── data-explorer.stories.tsx
│   │   │   ├── dataframe.stories.tsx
│   │   │   ├── data-table.stories.tsx
│   │   │   ├── debugger.stories.tsx
│   │   │   ├── dialog.stories.tsx
│   │   │   ├── dropdown-menu.mdx
│   │   │   ├── editor-inputs.stories.tsx
│   │   │   ├── editor.stories.tsx
│   │   │   ├── file-upload.stories.tsx
│   │   │   ├── __fixtures__
│   │   │   │   └── vega.ts
│   │   │   ├── form-wrapper.stories.tsx
│   │   │   ├── input.stories.tsx
│   │   │   ├── label.mdx
│   │   │   ├── layout
│   │   │   │   └── vertical
│   │   │   │       └── one-column.stories.tsx
│   │   │   ├── log-viewer.stories.tsx
│   │   │   ├── number-field.mdx
│   │   │   ├── number-field.stories.tsx
│   │   │   ├── progress-component.stories.tsx
│   │   │   ├── progress.stories.tsx
│   │   │   ├── radio-group.mdx
│   │   │   ├── select-native.stories.tsx
│   │   │   ├── select.stories.tsx
│   │   │   ├── slider.stories.tsx
│   │   │   ├── stat.stories.tsx
│   │   │   ├── switchable-multi-select.stories.tsx
│   │   │   ├── switch.mdx
│   │   │   ├── tabs.mdx
│   │   │   ├── textarea.stories.tsx
│   │   │   ├── theme.stories.tsx
│   │   │   ├── tooltip.mdx
│   │   │   ├── typography.stories.tsx
│   │   │   ├── variables.stories.tsx
│   │   │   └── vega.stories.tsx
│   │   ├── __tests__
│   │   │   ├── CellStatus.test.tsx
│   │   │   ├── chat-history.test.ts
│   │   │   ├── chat-utils.test.ts
│   │   │   ├── main.test.tsx
│   │   │   ├── mocks.ts
│   │   │   ├── mount.test.ts
│   │   │   ├── setup.ts
│   │   │   ├── __snapshots__
│   │   │   │   └── CellStatus.test.tsx.snap
│   │   │   └── test-helpers.ts
│   │   ├── theme
│   │   │   ├── namespace.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   └── useTheme.ts
│   │   └── utils
│   │       ├── arrays.ts
│   │       ├── assertExists.ts
│   │       ├── assertNever.ts
│   │       ├── async-capture-tracker.ts
│   │       ├── batch-requests.ts
│   │       ├── blob.ts
│   │       ├── capabilities.ts
│   │       ├── cell-urls.ts
│   │       ├── cn.ts
│   │       ├── copy.ts
│   │       ├── createReducer.ts
│   │       ├── dates.ts
│   │       ├── Deferred.ts
│   │       ├── dereference.ts
│   │       ├── dom.ts
│   │       ├── download.ts
│   │       ├── edit-distance.ts
│   │       ├── errors.ts
│   │       ├── events.ts
│   │       ├── filenames.ts
│   │       ├── fileToBase64.ts
│   │       ├── formatting.ts
│   │       ├── functions.ts
│   │       ├── html-to-image.ts
│   │       ├── idle.ts
│   │       ├── id-tree.tsx
│   │       ├── iframe.ts
│   │       ├── invariant.ts
│   │       ├── json
│   │       │   ├── base64.ts
│   │       │   ├── json-parser.ts
│   │       │   └── __tests__
│   │       │       └── base64.test.ts
│   │       ├── lazy.ts
│   │       ├── links.ts
│   │       ├── Logger.ts
│   │       ├── lru.ts
│   │       ├── maps.ts
│   │       ├── math.ts
│   │       ├── mergeRefs.ts
│   │       ├── mime-types.ts
│   │       ├── multi-map.ts
│   │       ├── numbers.ts
│   │       ├── objects.ts
│   │       ├── once.ts
│   │       ├── paths.ts
│   │       ├── pathUtils.test.ts
│   │       ├── pathUtils.ts
│   │       ├── pluralize.ts
│   │       ├── progress.ts
│   │       ├── python-poet
│   │       │   ├── poet.ts
│   │       │   └── __tests__
│   │       │       └── poet.test.ts
│   │       ├── reload-safe.ts
│   │       ├── repl.ts
│   │       ├── routes.ts
│   │       ├── scroll.ts
│   │       ├── sets.ts
│   │       ├── shallow-compare.ts
│   │       ├── staticImplements.ts
│   │       ├── storage
│   │       │   ├── jotai.ts
│   │       │   ├── storage.ts
│   │       │   └── typed.ts
│   │       ├── strings.ts
│   │       ├── __tests__
│   │       │   ├── arrays.test.ts
│   │       │   ├── async-capture-tracker.test.ts
│   │       │   ├── batch-requests.test.ts
│   │       │   ├── blob.test.ts
│   │       │   ├── capabilities.test.ts
│   │       │   ├── cell-urls.test.ts
│   │       │   ├── createReducer.test.ts
│   │       │   ├── dates.test.ts
│   │       │   ├── Deferred.test.ts
│   │       │   ├── dom.test.ts
│   │       │   ├── download.test.tsx
│   │       │   ├── edit-distance.test.ts
│   │       │   ├── errors.test.ts
│   │       │   ├── filenames.test.ts
│   │       │   ├── formatting.test.ts
│   │       │   ├── id-tree.test.ts
│   │       │   ├── iframe.test.ts
│   │       │   ├── json-parser.test.ts
│   │       │   ├── local-storage.test.ts
│   │       │   ├── lru.test.ts
│   │       │   ├── maps.test.ts
│   │       │   ├── math.test.ts
│   │       │   ├── mime-types.test.ts
│   │       │   ├── multi-map.test.ts
│   │       │   ├── numbers.test.ts
│   │       │   ├── objects.test.ts
│   │       │   ├── once.test.ts
│   │       │   ├── path.test.ts
│   │       │   ├── pluralize.test.ts
│   │       │   ├── progress.test.ts
│   │       │   ├── routes.test.ts
│   │       │   ├── scroll.test.ts
│   │       │   ├── sets.test.ts
│   │       │   ├── shallow-compare.test.ts
│   │       │   ├── storage.test.ts
│   │       │   ├── strings.test.ts
│   │       │   ├── timed-cache.test.ts
│   │       │   ├── timeout.test.ts
│   │       │   ├── time.test.ts
│   │       │   ├── traceback.test.ts
│   │       │   ├── url-parser.test.ts
│   │       │   ├── urls.test.ts
│   │       │   ├── url.test.ts
│   │       │   ├── versions.test.ts
│   │       │   └── waitForWs.test.ts
│   │       ├── timed-cache.ts
│   │       ├── timeout.ts
│   │       ├── time.ts
│   │       ├── toast-progress.tsx
│   │       ├── traceback.ts
│   │       ├── tracer.ts
│   │       ├── typed.ts
│   │       ├── url-parser.ts
│   │       ├── urls.ts
│   │       ├── url.ts
│   │       ├── uuid.ts
│   │       ├── versions.ts
│   │       ├── vitals.ts
│   │       ├── waitForWs.ts
│   │       └── zod-utils.ts
│   ├── tailwind.config.cjs
│   ├── technology-decisions.md
│   ├── test_retina.py
│   ├── tsconfig.json
│   ├── turbo.json
│   ├── vite.config.mts
│   └── vitest.config.ts
├── GOVERNANCE.md
├── LICENSE
├── Makefile
├── MANIFEST.in
├── marimo
│   ├── AGENTS.md
│   ├── _ai
│   │   ├── _convert.py
│   │   ├── __init__.py
│   │   ├── llm
│   │   │   ├── _impl.py
│   │   │   └── __init__.py
│   │   ├── _pydantic_ai_utils.py
│   │   ├── text_to_notebook.py
│   │   ├── _tools
│   │   │   ├── base.py
│   │   │   ├── tools
│   │   │   │   ├── cells.py
│   │   │   │   ├── datasource.py
│   │   │   │   ├── dependency_graph.py
│   │   │   │   ├── errors.py
│   │   │   │   ├── lint.py
│   │   │   │   ├── notebooks.py
│   │   │   │   ├── rules.py
│   │   │   │   └── tables_and_variables.py
│   │   │   ├── tools_registry.py
│   │   │   ├── types.py
│   │   │   └── utils
│   │   │       ├── exceptions.py
│   │   │       └── output_cleaning.py
│   │   └── _types.py
│   ├── _ast
│   │   ├── app_config.py
│   │   ├── app.py
│   │   ├── cell_id.py
│   │   ├── cell_manager.py
│   │   ├── cell.py
│   │   ├── codegen.py
│   │   ├── compiler.py
│   │   ├── errors.py
│   │   ├── fast_stack.py
│   │   ├── __init__.py
│   │   ├── load.py
│   │   ├── models.py
│   │   ├── names.py
│   │   ├── parse.py
│   │   ├── pytest.py
│   │   ├── sql_utils.py
│   │   ├── sql_visitor.py
│   │   ├── toplevel.py
│   │   ├── transformers.py
│   │   ├── variables.py
│   │   └── visitor.py
│   ├── _cli
│   │   ├── cli.py
│   │   ├── cli_validators.py
│   │   ├── config
│   │   │   ├── commands.py
│   │   │   └── utils.py
│   │   ├── convert
│   │   │   ├── commands.py
│   │   │   └── utils.py
│   │   ├── development
│   │   │   └── commands.py
│   │   ├── envinfo.py
│   │   ├── errors.py
│   │   ├── export
│   │   │   ├── cloudflare.py
│   │   │   ├── commands.py
│   │   │   └── thumbnail.py
│   │   ├── files
│   │   │   ├── cloudflare.py
│   │   │   ├── file_path.py
│   │   │   └── __init__.py
│   │   ├── help_formatter.py
│   │   ├── __init__.py
│   │   ├── install_hints.py
│   │   ├── parse_args.py
│   │   ├── parser_ux.py
│   │   ├── print.py
│   │   ├── run_docker.py
│   │   ├── sandbox.py
│   │   ├── suggestions.py
│   │   ├── upgrade.py
│   │   └── utils.py
│   ├── _config
│   │   ├── cli_state.py
│   │   ├── config.py
│   │   ├── __init__.py
│   │   ├── manager.py
│   │   ├── packages.py
│   │   ├── reader.py
│   │   ├── secrets.py
│   │   ├── settings.py
│   │   └── utils.py
│   ├── _convert
│   │   ├── common
│   │   │   ├── comment_preserver.py
│   │   │   ├── dom_traversal.py
│   │   │   ├── filename.py
│   │   │   ├── format.py
│   │   │   └── __init__.py
│   │   ├── converters.py
│   │   ├── __init__.py
│   │   ├── ipynb
│   │   │   ├── from_ir.py
│   │   │   ├── __init__.py
│   │   │   └── to_ir.py
│   │   ├── markdown
│   │   │   ├── from_ir.py
│   │   │   ├── __init__.py
│   │   │   └── to_ir.py
│   │   ├── non_marimo_python_script.py
│   │   ├── notebook.py
│   │   └── script.py
│   ├── _data
│   │   ├── charts.py
│   │   ├── _external_storage
│   │   │   ├── get_storage.py
│   │   │   ├── models.py
│   │   │   └── storage.py
│   │   ├── get_datasets.py
│   │   ├── models.py
│   │   ├── preview_column.py
│   │   ├── series.py
│   │   └── sql_summaries.py
│   ├── _dependencies
│   │   ├── dependencies.py
│   │   └── errors.py
│   ├── _entrypoints
│   │   ├── ids.py
│   │   └── registry.py
│   ├── __init__.py
│   ├── _internal
│   │   ├── commands.py
│   │   ├── config.py
│   │   ├── converters.py
│   │   ├── ids.py
│   │   ├── ipc.py
│   │   ├── notifications.py
│   │   ├── packages.py
│   │   ├── schemas.py
│   │   ├── server
│   │   │   ├── __init__.py
│   │   │   └── requests.py
│   │   ├── session
│   │   │   ├── extensions.py
│   │   │   └── __init__.py
│   │   └── templates.py
│   ├── _ipc
│   │   ├── connection.py
│   │   ├── __init__.py
│   │   ├── launch_kernel.py
│   │   ├── queue_manager.py
│   │   ├── queue_proxy.py
│   │   └── types.py
│   ├── _islands
│   │   ├── __init__.py
│   │   └── _island_generator.py
│   ├── _lint
│   │   ├── context.py
│   │   ├── diagnostic.py
│   │   ├── formatters
│   │   │   ├── base.py
│   │   │   ├── full.py
│   │   │   ├── __init__.py
│   │   │   └── json.py
│   │   ├── __init__.py
│   │   ├── linter.py
│   │   ├── rule_engine.py
│   │   ├── rules
│   │   │   ├── base.py
│   │   │   ├── breaking
│   │   │   │   ├── graph.py
│   │   │   │   ├── __init__.py
│   │   │   │   ├── syntax_error.py
│   │   │   │   └── unparsable.py
│   │   │   ├── formatting
│   │   │   │   ├── empty_cells.py
│   │   │   │   ├── general.py
│   │   │   │   ├── __init__.py
│   │   │   │   ├── markdown_dedent.py
│   │   │   │   └── parsing.py
│   │   │   ├── __init__.py
│   │   │   └── runtime
│   │   │       ├── branch_expression.py
│   │   │       ├── __init__.py
│   │   │       └── self_import.py
│   │   ├── validate_graph.py
│   │   └── visitors.py
│   ├── _loggers.py
│   ├── __main__.py
│   ├── _mcp
│   │   └── server
│   │       ├── exceptions.py
│   │       ├── lifespan.py
│   │       ├── main.py
│   │       ├── _prompts
│   │       │   ├── base.py
│   │       │   ├── prompts
│   │       │   │   ├── errors.py
│   │       │   │   └── notebooks.py
│   │       │   └── registry.py
│   │       └── responses.py
│   ├── _messaging
│   │   ├── cell_output.py
│   │   ├── completion_option.py
│   │   ├── console_output_worker.py
│   │   ├── context.py
│   │   ├── errors.py
│   │   ├── __init__.py
│   │   ├── mimetypes.py
│   │   ├── msgspec_encoder.py
│   │   ├── notification.py
│   │   ├── notification_utils.py
│   │   ├── print_override.py
│   │   ├── serde.py
│   │   ├── streams.py
│   │   ├── thread_local_streams.py
│   │   ├── tracebacks.py
│   │   ├── types.py
│   │   └── variables.py
│   ├── _metadata
│   │   ├── __init__.py
│   │   └── opengraph.py
│   ├── _output
│   │   ├── builder.py
│   │   ├── data
│   │   │   └── data.py
│   │   ├── doc.py
│   │   ├── formatters
│   │   │   ├── ai_formatters.py
│   │   │   ├── altair_formatters.py
│   │   │   ├── anywidget_formatters.py
│   │   │   ├── arviz_formatters.py
│   │   │   ├── bokeh_formatters.py
│   │   │   ├── cell.py
│   │   │   ├── df_formatters.py
│   │   │   ├── formatter_factory.py
│   │   │   ├── formatters.py
│   │   │   ├── holoviews_formatters.py
│   │   │   ├── iframe.py
│   │   │   ├── __init__.py
│   │   │   ├── ipython_formatters.py
│   │   │   ├── ipywidgets_formatters.py
│   │   │   ├── leafmap_formatters.py
│   │   │   ├── lets_plot_formatters.py
│   │   │   ├── matplotlib_formatters.py
│   │   │   ├── pandas_formatters.py
│   │   │   ├── panel_formatters.py
│   │   │   ├── plotly_formatters.py
│   │   │   ├── pyecharts_formatters.py
│   │   │   ├── pygwalker_formatters.py
│   │   │   ├── pytorch_formatters.py
│   │   │   ├── repr_formatters.py
│   │   │   ├── seaborn_formatters.py
│   │   │   ├── structures.py
│   │   │   ├── sympy_formatters.py
│   │   │   ├── tqdm_formatters.py
│   │   │   └── utils.py
│   │   ├── formatting.py
│   │   ├── hypertext.py
│   │   ├── __init__.py
│   │   ├── justify.py
│   │   ├── md_extensions
│   │   │   ├── breakless_lists.py
│   │   │   ├── display_math.py
│   │   │   ├── external_links.py
│   │   │   ├── flexible_indent.py
│   │   │   └── iconify.py
│   │   ├── md.py
│   │   ├── mime.py
│   │   ├── mpl.py
│   │   ├── outline.py
│   │   ├── rich_help.py
│   │   ├── show_code.py
│   │   ├── superjson.py
│   │   └── utils.py
│   ├── _plugins
│   │   ├── core
│   │   │   ├── media.py
│   │   │   └── web_component.py
│   │   ├── __init__.py
│   │   ├── stateless
│   │   │   ├── accordion.py
│   │   │   ├── audio.py
│   │   │   ├── callout.py
│   │   │   ├── carousel.py
│   │   │   ├── download.py
│   │   │   ├── flex.py
│   │   │   ├── icon.py
│   │   │   ├── image_compare.py
│   │   │   ├── image.py
│   │   │   ├── __init__.py
│   │   │   ├── inspect.py
│   │   │   ├── json_component.py
│   │   │   ├── json_output.py
│   │   │   ├── lazy.py
│   │   │   ├── mermaid.py
│   │   │   ├── mime.py
│   │   │   ├── mpl
│   │   │   │   ├── __init__.py
│   │   │   │   └── _mpl.py
│   │   │   ├── nav_menu.py
│   │   │   ├── pdf.py
│   │   │   ├── plain_text.py
│   │   │   ├── routes.py
│   │   │   ├── sidebar.py
│   │   │   ├── stat.py
│   │   │   ├── status
│   │   │   │   ├── __init__.py
│   │   │   │   └── _progress.py
│   │   │   ├── style.py
│   │   │   ├── tabs.py
│   │   │   ├── tree.py
│   │   │   └── video.py
│   │   ├── ui
│   │   │   ├── _core
│   │   │   │   ├── ids.py
│   │   │   │   ├── __init__.py
│   │   │   │   ├── registry.py
│   │   │   │   └── ui_element.py
│   │   │   ├── _impl
│   │   │   │   ├── altair_chart.py
│   │   │   │   ├── anywidget
│   │   │   │   │   ├── init.py
│   │   │   │   │   ├── types.py
│   │   │   │   │   └── utils.py
│   │   │   │   ├── array.py
│   │   │   │   ├── batch.py
│   │   │   │   ├── charts
│   │   │   │   │   └── altair_transformer.py
│   │   │   │   ├── chat
│   │   │   │   │   ├── chat.py
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   └── utils.py
│   │   │   │   ├── comm.py
│   │   │   │   ├── data_editor.py
│   │   │   │   ├── data_explorer.py
│   │   │   │   ├── dataframes
│   │   │   │   │   ├── dataframe.py
│   │   │   │   │   ├── __init__.py
│   │   │   │   │   └── transforms
│   │   │   │   │       ├── apply.py
│   │   │   │   │       ├── handlers.py
│   │   │   │   │       ├── print_code.py
│   │   │   │   │       └── types.py
│   │   │   │   ├── dates.py
│   │   │   │   ├── dictionary.py
│   │   │   │   ├── file_browser.py
│   │   │   │   ├── from_anywidget.py
│   │   │   │   ├── from_panel.py
│   │   │   │   ├── __init__.py
│   │   │   │   ├── input.py
│   │   │   │   ├── matrix.py
│   │   │   │   ├── microphone.py
│   │   │   │   ├── mpl.py
│   │   │   │   ├── plotly.py
│   │   │   │   ├── refresh.py
│   │   │   │   ├── run_button.py
│   │   │   │   ├── switch.py
│   │   │   │   ├── table.py
│   │   │   │   ├── tables
│   │   │   │   │   ├── default_table.py
│   │   │   │   │   ├── format.py
│   │   │   │   │   ├── ibis_table.py
│   │   │   │   │   ├── narwhals_table.py
│   │   │   │   │   ├── pandas_table.py
│   │   │   │   │   ├── polars_table.py
│   │   │   │   │   ├── selection.py
│   │   │   │   │   ├── table_manager.py
│   │   │   │   │   └── utils.py
│   │   │   │   ├── tabs.py
│   │   │   │   └── utils
│   │   │   │       └── dataframe.py
│   │   │   └── __init__.py
│   │   └── validators.py
│   ├── _pyodide
│   │   ├── bootstrap.py
│   │   ├── pyodide_session.py
│   │   ├── restartable_task.py
│   │   └── streams.py
│   ├── py.typed
│   ├── _runtime
│   │   ├── app
│   │   │   ├── common.py
│   │   │   ├── kernel_runner.py
│   │   │   └── script_runner.py
│   │   ├── app_meta.py
│   │   ├── capture.py
│   │   ├── cell_lifecycle_item.py
│   │   ├── cell_lifecycle_registry.py
│   │   ├── cell_output_list.py
│   │   ├── commands.py
│   │   ├── complete.py
│   │   ├── context
│   │   │   ├── __init__.py
│   │   │   ├── kernel_context.py
│   │   │   ├── script_context.py
│   │   │   ├── types.py
│   │   │   └── utils.py
│   │   ├── control_flow.py
│   │   ├── copy.py
│   │   ├── dataflow
│   │   │   ├── cycles.py
│   │   │   ├── definitions.py
│   │   │   ├── edges.py
│   │   │   ├── graph.py
│   │   │   ├── __init__.py
│   │   │   ├── runner.py
│   │   │   ├── topology.py
│   │   │   └── types.py
│   │   ├── exceptions.py
│   │   ├── executor.py
│   │   ├── functions.py
│   │   ├── handlers.py
│   │   ├── __init__.py
│   │   ├── input_override.py
│   │   ├── layout
│   │   │   └── layout.py
│   │   ├── marimo_browser.py
│   │   ├── marimo_pdb.py
│   │   ├── output
│   │   │   ├── __init__.py
│   │   │   └── _output.py
│   │   ├── packages
│   │   │   ├── conda_package_manager.py
│   │   │   ├── import_error_extractors.py
│   │   │   ├── module_name_to_conda_name.py
│   │   │   ├── module_name_to_pypi_name.py
│   │   │   ├── module_registry.py
│   │   │   ├── package_manager.py
│   │   │   ├── package_managers.py
│   │   │   ├── pypi_package_manager.py
│   │   │   └── utils.py
│   │   ├── params.py
│   │   ├── patches.py
│   │   ├── primitives.py
│   │   ├── pytest.py
│   │   ├── redirect_streams.py
│   │   ├── reload
│   │   │   ├── autoreload.py
│   │   │   ├── __init__.py
│   │   │   └── module_watcher.py
│   │   ├── runner
│   │   │   ├── cell_runner.py
│   │   │   ├── hook_context.py
│   │   │   ├── hooks_on_finish.py
│   │   │   ├── hooks_post_execution.py
│   │   │   ├── hooks_pre_execution.py
│   │   │   ├── hooks_preparation.py
│   │   │   ├── hooks.py
│   │   │   └── __init__.py
│   │   ├── runtime.py
│   │   ├── scratch.py
│   │   ├── side_effect.py
│   │   ├── state.py
│   │   ├── threads.py
│   │   ├── utils
│   │   │   └── set_ui_element_request_manager.py
│   │   ├── virtual_file
│   │   │   ├── __init__.py
│   │   │   ├── storage.py
│   │   │   └── virtual_file.py
│   │   ├── watch
│   │   │   ├── _directory.py
│   │   │   ├── _file.py
│   │   │   ├── __init__.py
│   │   │   └── _path.py
│   │   └── win32_interrupt_handler.py
│   ├── _save
│   │   ├── cache.py
│   │   ├── hash.py
│   │   ├── __init__.py
│   │   ├── loaders
│   │   │   ├── __init__.py
│   │   │   ├── json.py
│   │   │   ├── loader.py
│   │   │   ├── memory.py
│   │   │   └── pickle.py
│   │   ├── save.py
│   │   ├── stores
│   │   │   ├── file.py
│   │   │   ├── __init__.py
│   │   │   ├── redis.py
│   │   │   ├── rest.py
│   │   │   ├── store.py
│   │   │   └── tiered.py
│   │   ├── stubs
│   │   │   ├── function_stub.py
│   │   │   ├── __init__.py
│   │   │   ├── module_stub.py
│   │   │   ├── pydantic_stub.py
│   │   │   ├── stubs.py
│   │   │   └── ui_element_stub.py
│   │   └── toplevel.py
│   ├── _schemas
│   │   ├── common.py
│   │   ├── generated
│   │   │   ├── notebook.yaml
│   │   │   ├── notifications.yaml
│   │   │   └── session.yaml
│   │   ├── notebook.py
│   │   ├── README.md
│   │   ├── serialization.py
│   │   └── session.py
│   ├── _secrets
│   │   ├── env_provider.py
│   │   ├── load_dotenv.py
│   │   ├── models.py
│   │   └── secrets.py
│   ├── _server
│   │   ├── ai
│   │   │   ├── config.py
│   │   │   ├── constants.py
│   │   │   ├── ids.py
│   │   │   ├── mcp
│   │   │   │   ├── client.py
│   │   │   │   ├── config.py
│   │   │   │   ├── __init__.py
│   │   │   │   ├── transport.py
│   │   │   │   └── types.py
│   │   │   ├── prompts.py
│   │   │   ├── providers.py
│   │   │   └── tools
│   │   │       ├── tool_manager.py
│   │   │       └── types.py
│   │   ├── api
│   │   │   ├── auth.py
│   │   │   ├── dependency_tree.py
│   │   │   ├── deps.py
│   │   │   ├── endpoints
│   │   │   │   ├── ai.py
│   │   │   │   ├── assets.py
│   │   │   │   ├── cache.py
│   │   │   │   ├── config.py
│   │   │   │   ├── datasources.py
│   │   │   │   ├── documentation.py
│   │   │   │   ├── editing.py
│   │   │   │   ├── execution.py
│   │   │   │   ├── export.py
│   │   │   │   ├── file_explorer.py
│   │   │   │   ├── files.py
│   │   │   │   ├── health.py
│   │   │   │   ├── home.py
│   │   │   │   ├── login.py
│   │   │   │   ├── lsp.py
│   │   │   │   ├── mpl.py
│   │   │   │   ├── packages.py
│   │   │   │   ├── secrets.py
│   │   │   │   ├── sql.py
│   │   │   │   ├── storage.py
│   │   │   │   ├── terminal.py
│   │   │   │   ├── ws
│   │   │   │   │   ├── ws_connection_validator.py
│   │   │   │   │   ├── ws_formatter.py
│   │   │   │   │   ├── ws_kernel_ready.py
│   │   │   │   │   ├── ws_message_loop.py
│   │   │   │   │   ├── ws_rtc_handler.py
│   │   │   │   │   └── ws_session_connector.py
│   │   │   │   └── ws_endpoint.py
│   │   │   ├── interrupt.py
│   │   │   ├── lifespans.py
│   │   │   ├── middleware.py
│   │   │   ├── router.py
│   │   │   └── utils.py
│   │   ├── app_defaults.py
│   │   ├── asgi.py
│   │   ├── codes.py
│   │   ├── config.py
│   │   ├── errors.py
│   │   ├── exceptions.py
│   │   ├── export
│   │   │   ├── exporter.py
│   │   │   └── __init__.py
│   │   ├── file_router.py
│   │   ├── files
│   │   │   ├── directory_scanner.py
│   │   │   ├── file_system.py
│   │   │   ├── os_file_system.py
│   │   │   └── path_validator.py
│   │   ├── __init__.py
│   │   ├── lsp.py
│   │   ├── main.py
│   │   ├── models
│   │   │   ├── completion.py
│   │   │   ├── export.py
│   │   │   ├── files.py
│   │   │   ├── home.py
│   │   │   ├── lsp.py
│   │   │   ├── models.py
│   │   │   ├── packages.py
│   │   │   └── secrets.py
│   │   ├── print.py
│   │   ├── recents.py
│   │   ├── registry.py
│   │   ├── responses.py
│   │   ├── resume_strategies.py
│   │   ├── router.py
│   │   ├── rtc
│   │   │   └── doc.py
│   │   ├── session
│   │   │   └── listeners.py
│   │   ├── session_manager.py
│   │   ├── start.py
│   │   ├── templates
│   │   │   ├── api.py
│   │   │   └── templates.py
│   │   ├── token_manager.py
│   │   ├── tokens.py
│   │   ├── utils.py
│   │   └── uvicorn_utils.py
│   ├── _session
│   │   ├── consumer.py
│   │   ├── events.py
│   │   ├── extensions
│   │   │   ├── extensions.py
│   │   │   ├── __init__.py
│   │   │   └── types.py
│   │   ├── file_change_handler.py
│   │   ├── file_watcher_integration.py
│   │   ├── __init__.py
│   │   ├── managers
│   │   │   ├── __init__.py
│   │   │   ├── ipc.py
│   │   │   ├── kernel.py
│   │   │   └── queue.py
│   │   ├── model.py
│   │   ├── notebook
│   │   │   ├── file_manager.py
│   │   │   ├── __init__.py
│   │   │   ├── serializer.py
│   │   │   └── storage.py
│   │   ├── queue.py
│   │   ├── room.py
│   │   ├── session.py
│   │   ├── session_repository.py
│   │   ├── state
│   │   │   ├── __init__.py
│   │   │   ├── serialize.py
│   │   │   └── session_view.py
│   │   ├── types.py
│   │   ├── utils.py
│   │   └── _venv.py
│   ├── _smoke_tests
│   │   ├── 2d-cells.py
│   │   ├── admonitions.py
│   │   ├── ai
│   │   │   ├── chat-variations.py
│   │   │   ├── gemini_responses.py
│   │   │   ├── github_model_check.py
│   │   │   ├── model_check.py
│   │   │   └── openai_responses.py
│   │   ├── altair_examples
│   │   │   ├── altair_brush.py
│   │   │   ├── altair_charts.py
│   │   │   ├── altair_datetime.py
│   │   │   ├── altair_geoshape.py
│   │   │   ├── altair_polars.py
│   │   │   ├── binary_values.py
│   │   │   ├── binning.py
│   │   │   ├── boxplot.py
│   │   │   ├── chart_dates.py
│   │   │   ├── column_facet.py
│   │   │   ├── composite_legend_selection.py
│   │   │   ├── embed_options.py
│   │   │   ├── hconcat_vconcat.py
│   │   │   ├── layered_charts.py
│   │   │   ├── map_selection.py
│   │   │   ├── nans_infinity.py
│   │   │   ├── narwhals_compat.py
│   │   │   ├── nested_vconcat.py
│   │   │   ├── repeat.py
│   │   │   ├── special_chars.py
│   │   │   ├── text_selection.py
│   │   │   ├── timestamp_with_no_timezone.py
│   │   │   ├── tooltip_images.py
│   │   │   ├── upset.py
│   │   │   ├── vegafusion_histograms.py
│   │   │   ├── vegafusion_nb.py
│   │   │   └── vegafusion_select.py
│   │   ├── ansi.py
│   │   ├── anywidget_compat.py
│   │   ├── anywidget_examples
│   │   │   ├── esm_rerender.py
│   │   │   ├── lonboard_example.py
│   │   │   └── scatter.py
│   │   ├── anywidget_smoke_tests
│   │   │   ├── maplibre_example.py
│   │   │   ├── mosaic_example.py
│   │   │   ├── multiple_models.py
│   │   │   ├── uchimata_example.py
│   │   │   └── weather.yaml
│   │   ├── appcomp
│   │   │   ├── double_nested
│   │   │   │   ├── inner.py
│   │   │   │   ├── main.py
│   │   │   │   └── middle.py
│   │   │   ├── imperative_output
│   │   │   │   ├── imperative_output.py
│   │   │   │   └── main.py
│   │   │   ├── inner.py
│   │   │   ├── main.py
│   │   │   ├── make_table.py
│   │   │   ├── resetting_sliders
│   │   │   │   ├── embed_test_a.py
│   │   │   │   └── embed_test_b.py
│   │   │   ├── setup_embed_setup
│   │   │   │   ├── inner_with_setup.py
│   │   │   │   └── main.py
│   │   │   ├── state
│   │   │   │   ├── main.py
│   │   │   │   └── state.py
│   │   │   └── ui_elements_with_overrides
│   │   │       ├── embed_test_a.py
│   │   │       └── embed_test_b.py
│   │   ├── app_fn.py
│   │   ├── arrays_and_dicts.py
│   │   ├── async
│   │   │   └── background_tasks.py
│   │   ├── async_iterator.py
│   │   ├── auto_instantiate_off.py
│   │   ├── bokeh_figure.py
│   │   ├── buttons.py
│   │   ├── cache_kwargs.py
│   │   ├── carousel.py
│   │   ├── charts
│   │   │   ├── 1mil_flights.py
│   │   │   └── histograms.py
│   │   ├── chat
│   │   │   └── chatbot.py
│   │   ├── cli_args.py
│   │   ├── code_editor.py
│   │   ├── compat
│   │   │   ├── ipython_display.py
│   │   │   └── python314.py
│   │   ├── custom_server
│   │   │   └── my_server.py
│   │   ├── data_explorer.py
│   │   ├── dataframe.py
│   │   ├── dataframes
│   │   │   ├── dicts_vs_dfs.py
│   │   │   └── transforms.py
│   │   ├── datasources.py
│   │   ├── dates.py
│   │   ├── debounce_input.py
│   │   ├── debounce.py
│   │   ├── df_index.py
│   │   ├── docs
│   │   │   └── docstrings.py
│   │   ├── doctests.py
│   │   ├── dropdowns.py
│   │   ├── editable_df.py
│   │   ├── errors
│   │   │   └── autofix.py
│   │   ├── errors.py
│   │   ├── files
│   │   │   └── cloudpath_file_browser.py
│   │   ├── formatters
│   │   │   ├── ibis_opinionated_formatters.py
│   │   │   ├── inspect_things.py
│   │   │   └── pytorch_formatters.py
│   │   ├── forms.py
│   │   ├── from_series.py
│   │   ├── full_width.py
│   │   ├── grid.py
│   │   ├── ibis_example.py
│   │   ├── ibis_formatting.py
│   │   ├── icons.py
│   │   ├── import_named_cells.py
│   │   ├── initial_table.py
│   │   ├── inputs
│   │   │   ├── numbers.py
│   │   │   └── sliders.py
│   │   ├── inputs.py
│   │   ├── iplot.py
│   │   ├── ipython
│   │   │   ├── img_mimebundle.py
│   │   │   ├── mpl_plot.py
│   │   │   └── progress.py
│   │   ├── issues
│   │   │   ├── 1033.py
│   │   │   ├── 1055.py
│   │   │   ├── 1064.py
│   │   │   ├── 1072.py
│   │   │   ├── 1086.py
│   │   │   ├── 1107.py
│   │   │   ├── 1140.py
│   │   │   ├── 1161.py
│   │   │   ├── 1165.py
│   │   │   ├── 1241.py
│   │   │   ├── 1270.py
│   │   │   ├── 1271.py
│   │   │   ├── 1273.py
│   │   │   ├── 1274.py
│   │   │   ├── 1279.py
│   │   │   ├── 1291.py
│   │   │   ├── 1311.py
│   │   │   ├── 1312.py
│   │   │   ├── 1319.py
│   │   │   ├── 1351.py
│   │   │   ├── 1362.py
│   │   │   ├── 1510.py
│   │   │   ├── 1530.py
│   │   │   ├── 1545.py
│   │   │   ├── 1586.py
│   │   │   ├── 1602.py
│   │   │   ├── 1654-virtualize-multiselect.py
│   │   │   ├── 1684.py
│   │   │   ├── 1689.py
│   │   │   ├── 1706.py
│   │   │   ├── 1710.py
│   │   │   ├── 1711.py
│   │   │   ├── 1816.py
│   │   │   ├── 1851.py
│   │   │   ├── 1927.py
│   │   │   ├── 1933.py
│   │   │   ├── 2000-explode-columns.py
│   │   │   ├── 2005.py
│   │   │   ├── 2019-sql-refs.py
│   │   │   ├── 2070-latex-slides.py
│   │   │   ├── 2137-realtime-markdown.py
│   │   │   ├── 2146-admonitions.py
│   │   │   ├── 2173-accordion.py
│   │   │   ├── 2211-pandas-formatting.py
│   │   │   ├── 2216-accordions.py
│   │   │   ├── 2315.py
│   │   │   ├── 2327_table_staleness.py
│   │   │   ├── 2357-table-ui-elements.py
│   │   │   ├── 2366-anywidget-binary.py
│   │   │   ├── 2403_table_ui_staleness.py
│   │   │   ├── 2457-plotly-section.py
│   │   │   ├── 2506_anywidget_buffer_paths.py
│   │   │   ├── 2526-plotly-refresh-on-data-change.py
│   │   │   ├── 2550-search-polars.py
│   │   │   ├── 2628_bar_container.py
│   │   │   ├── 2648_file_browser_reset.py
│   │   │   ├── 2702-altair-deserialization.py
│   │   │   ├── 2871_timezones.py
│   │   │   ├── 2991-df-columns.py
│   │   │   ├── 3107-dataframe-perf.py
│   │   │   ├── 3141_update_completion.py
│   │   │   ├── 3142-table-in-accordion.py
│   │   │   ├── 3187_kernel_dies.py
│   │   │   ├── 3564_altair_timezone.py
│   │   │   ├── 3962-anywidget-partial-state-2.py
│   │   │   ├── 3962-anywidget-partial-state.py
│   │   │   ├── 4515_ui_id_collision.py
│   │   │   ├── 4544_flex.py
│   │   │   ├── 4548_md_max_width.py
│   │   │   ├── 4579_mathjax_plotly.py
│   │   │   ├── 4624_markdown_max_width.py
│   │   │   ├── 4744-fixed-loading-indicator.py
│   │   │   ├── 4746_altair_hstacks.py
│   │   │   ├── 4970-unique-transform.py
│   │   │   ├── 5129.py
│   │   │   ├── 643.py
│   │   │   ├── 7345-dataframe-pivot-transform.py
│   │   │   ├── 7661_point_selection.py
│   │   │   ├── 7668_altair_concat_interactions.py
│   │   │   ├── 8023_stale_table.py
│   │   │   ├── 8184_mpl_interactive_large_plot.py
│   │   │   ├── 846.py
│   │   │   ├── 852.py
│   │   │   ├── 877.py
│   │   │   ├── 881.py
│   │   │   ├── 924.py
│   │   │   ├── 970-freeze-columns.py
│   │   │   ├── altair_bug.py
│   │   │   ├── df-conversion.py
│   │   │   ├── key_with_period.py
│   │   │   └── layouts
│   │   │       └── 2070-latex-slides.slides.json
│   │   ├── latex
│   │   │   ├── 704.py
│   │   │   ├── global_defs.py
│   │   │   ├── latex.md
│   │   │   ├── latex.py
│   │   │   └── macros.tex
│   │   ├── layout.py
│   │   ├── layouts
│   │   │   ├── grid.grid.json
│   │   │   └── slides.slides.json
│   │   ├── lazy.py
│   │   ├── lens_test.py
│   │   ├── logs.py
│   │   ├── lsp
│   │   │   └── ruff_errors.py
│   │   ├── markdown
│   │   │   ├── anchor_links.py
│   │   │   ├── caret.py
│   │   │   ├── codeblocks.py
│   │   │   ├── highlight.py
│   │   │   ├── latex_display_math.py
│   │   │   ├── latex_highlighting.py
│   │   │   ├── markdown_pymdownx.py
│   │   │   ├── markdown_quotes.py
│   │   │   ├── markdown_size.py
│   │   │   ├── rerendering_latex.py
│   │   │   ├── sane_lists.py
│   │   │   └── stacked.py
│   │   ├── matrix.py
│   │   ├── md.py
│   │   ├── media.py
│   │   ├── mimes.py
│   │   ├── mpl
│   │   │   └── basic_image.py
│   │   ├── named_cells.py
│   │   ├── nav_menus.py
│   │   ├── nav_menu_submenu_positioning.py
│   │   ├── nb_dir.py
│   │   ├── nested.py
│   │   ├── no_mutating.py
│   │   ├── outline.py
│   │   ├── output.py
│   │   ├── outputs
│   │   │   └── console_with_links.py
│   │   ├── packages
│   │   │   └── is_in_uv.py
│   │   ├── pandas_smoke_tests
│   │   │   ├── dates.py
│   │   │   ├── datetime_index_columns.py
│   │   │   ├── pandas_multi_idx.py
│   │   │   ├── pandas_nan.py
│   │   │   └── pandas_subplots.py
│   │   ├── parse
│   │   │   ├── classes.py
│   │   │   └── classes_with_types.py
│   │   ├── pdb_test.py
│   │   ├── pdf_export
│   │   │   └── basic_example.py
│   │   ├── pdf.py
│   │   ├── plain.py
│   │   ├── plotly
│   │   │   ├── fig_show_run_as_script.py
│   │   │   ├── _plotly_resampler.py
│   │   │   ├── scattermap_selection.py
│   │   │   └── shapes.py
│   │   ├── _polars
│   │   │   ├── polars_date_column.py
│   │   │   └── polars_to_csv.py
│   │   ├── polars
│   │   │   ├── polars_duration.py
│   │   │   └── timezones.py
│   │   ├── primitives
│   │   │   └── _decimal.py
│   │   ├── pyg_walker.py
│   │   ├── pygwalker_test.py
│   │   ├── quak-demo.py
│   │   ├── query_params.py
│   │   ├── raise_error_on_output.py
│   │   ├── raise_exception_on_change.py
│   │   ├── reactive_pytest.py
│   │   ├── refresh.py
│   │   ├── _requests.py
│   │   ├── routes.py
│   │   ├── run_button.py
│   │   ├── sandbox
│   │   │   └── git_source.py
│   │   ├── scale.py
│   │   ├── scripting.py
│   │   ├── scripts
│   │   │   └── logging_in_scripts.py
│   │   ├── series_formatting.py
│   │   ├── sidebar.py
│   │   ├── slides_examples
│   │   │   ├── centered_slides.py
│   │   │   └── layouts
│   │   │       └── centered_slides.slides.json
│   │   ├── slides.py
│   │   ├── sql
│   │   │   ├── dbapi_sqlite.py
│   │   │   ├── duckdb_engine.py
│   │   │   ├── duckdb_interrupt.py
│   │   │   ├── duckdb_tokenize.py
│   │   │   ├── ibis_backend_catalog.py
│   │   │   ├── ibis_backend.py
│   │   │   ├── iceberg_catalog.py
│   │   │   ├── limits.py
│   │   │   ├── local_db_deps.py
│   │   │   ├── numpy_sql.py
│   │   │   ├── parse_errors.py
│   │   │   ├── polars_sql.py
│   │   │   ├── redshift_example.py
│   │   │   ├── sql_alchemy_engine.py
│   │   │   ├── sql_alchemy.py
│   │   │   └── sqlmodel_engine.py
│   │   ├── sql_error_handling.py
│   │   ├── sql.py
│   │   ├── state.py
│   │   ├── stats.py
│   │   ├── status
│   │   │   └── status.py
│   │   ├── stdin.py
│   │   ├── stop.py
│   │   ├── structures.py
│   │   ├── supabase_example.py
│   │   ├── tables
│   │   │   ├── big_ints.py
│   │   │   ├── booleans.py
│   │   │   ├── columnar_tables.py
│   │   │   ├── column-header-chart.py
│   │   │   ├── complex_types.py
│   │   │   ├── decimals.py
│   │   │   ├── dictionary_table.py
│   │   │   ├── ibis_example.py
│   │   │   ├── ibis_interactive.py
│   │   │   ├── images.py
│   │   │   ├── lazy_polars.py
│   │   │   ├── lazy.py
│   │   │   ├── markdown_example.py
│   │   │   ├── milliseconds.py
│   │   │   ├── nans.py
│   │   │   ├── rich_elements.py
│   │   │   ├── selection.py
│   │   │   ├── server_pagination.py
│   │   │   └── subseconds.py
│   │   ├── table_urls.py
│   │   ├── theming
│   │   │   ├── altair_theme.py
│   │   │   ├── apply_theme.py
│   │   │   ├── bokeh_theme.py
│   │   │   ├── custom.css
│   │   │   ├── custom_css.py
│   │   │   ├── custom_head.py
│   │   │   ├── head.html
│   │   │   ├── matplotlib_theme.py
│   │   │   └── plotly_theme.py
│   │   ├── third_party
│   │   │   ├── altair_example.py
│   │   │   ├── arviz_html.py
│   │   │   ├── databricks_connect.py
│   │   │   ├── holoviews_example.py
│   │   │   ├── holoviews_output_options.py
│   │   │   ├── holoviews_scatter.py
│   │   │   ├── ipython_display.py
│   │   │   ├── leafmap
│   │   │   │   └── backends.py
│   │   │   ├── lonboard_example.py
│   │   │   ├── mohtml_example.py
│   │   │   ├── pandas
│   │   │   │   ├── int_column_names.py
│   │   │   │   └── transform_edgecases.py
│   │   │   ├── pandas_example.py
│   │   │   ├── panel_example.py
│   │   │   ├── plotly_example.py
│   │   │   ├── pyeacharts_example.py
│   │   │   ├── pymc_example.py
│   │   │   ├── rich_example.py
│   │   │   ├── seaborn_example.py
│   │   │   └── _treescope.py
│   │   ├── threads
│   │   │   ├── multiple_appends.py
│   │   │   ├── progress_bar_threads.py
│   │   │   ├── state_threading.py
│   │   │   └── threads.py
│   │   ├── timezones.py
│   │   ├── toast.py
│   │   ├── tooltips.py
│   │   ├── tqdm_notebook.py
│   │   ├── tqdm_update_test.py
│   │   ├── _transformers
│   │   │   └── text_streamer.py
│   │   ├── ui_matplotlib.py
│   │   ├── vector.py
│   │   └── ws.py
│   ├── _snippets
│   │   ├── data
│   │   │   ├── altair-0.py
│   │   │   ├── altair-10.py
│   │   │   ├── altair-11.py
│   │   │   ├── altair-12.py
│   │   │   ├── altair-13.py
│   │   │   ├── altair-14.py
│   │   │   ├── altair-1.py
│   │   │   ├── altair-2.py
│   │   │   ├── altair-3.py
│   │   │   ├── altair-4.py
│   │   │   ├── altair-5.py
│   │   │   ├── altair-6.py
│   │   │   ├── altair-7.py
│   │   │   ├── altair-8.py
│   │   │   ├── altair-9.py
│   │   │   ├── aws-s3-0.py
│   │   │   ├── cli-args-0.py
│   │   │   ├── duckdb-0.py
│   │   │   ├── duckdb-1.py
│   │   │   ├── duckdb-2.py
│   │   │   ├── duckdb-3.py
│   │   │   ├── duckdb-4.py
│   │   │   ├── duckdb-5.py
│   │   │   ├── duckdb-6.py
│   │   │   ├── duckdb-7.py
│   │   │   ├── duckdb-8.py
│   │   │   ├── env-0.py
│   │   │   ├── fsspec-0.py
│   │   │   ├── gcs-0.py
│   │   │   ├── huggingface-0.py
│   │   │   ├── huggingface-1.py
│   │   │   ├── matplotlib-0.py
│   │   │   ├── matplotlib-10.py
│   │   │   ├── matplotlib-11.py
│   │   │   ├── matplotlib-1.py
│   │   │   ├── matplotlib-2.py
│   │   │   ├── matplotlib-3.py
│   │   │   ├── matplotlib-4.py
│   │   │   ├── matplotlib-5.py
│   │   │   ├── matplotlib-6.py
│   │   │   ├── matplotlib-7.py
│   │   │   ├── matplotlib-8.py
│   │   │   ├── matplotlib-9.py
│   │   │   ├── openai-0.py
│   │   │   ├── openai-1.py
│   │   │   ├── pandas-0.py
│   │   │   ├── pandas-10.py
│   │   │   ├── pandas-11.py
│   │   │   ├── pandas-12.py
│   │   │   ├── pandas-13.py
│   │   │   ├── pandas-14.py
│   │   │   ├── pandas-15.py
│   │   │   ├── pandas-16.py
│   │   │   ├── pandas-17.py
│   │   │   ├── pandas-18.py
│   │   │   ├── pandas-19.py
│   │   │   ├── pandas-1.py
│   │   │   ├── pandas-20.py
│   │   │   ├── pandas-21.py
│   │   │   ├── pandas-22.py
│   │   │   ├── pandas-23.py
│   │   │   ├── pandas-24.py
│   │   │   ├── pandas-25.py
│   │   │   ├── pandas-26.py
│   │   │   ├── pandas-27.py
│   │   │   ├── pandas-28.py
│   │   │   ├── pandas-29.py
│   │   │   ├── pandas-2.py
│   │   │   ├── pandas-30.py
│   │   │   ├── pandas-31.py
│   │   │   ├── pandas-32.py
│   │   │   ├── pandas-33.py
│   │   │   ├── pandas-34.py
│   │   │   ├── pandas-35.py
│   │   │   ├── pandas-36.py
│   │   │   ├── pandas-3.py
│   │   │   ├── pandas-4.py
│   │   │   ├── pandas-5.py
│   │   │   ├── pandas-6.py
│   │   │   ├── pandas-7.py
│   │   │   ├── pandas-8.py
│   │   │   ├── pandas-9.py
│   │   │   ├── polars-0.py
│   │   │   ├── polars-10.py
│   │   │   ├── polars-11.py
│   │   │   ├── polars-12.py
│   │   │   ├── polars-1.py
│   │   │   ├── polars-2.py
│   │   │   ├── polars-3.py
│   │   │   ├── polars-4.py
│   │   │   ├── polars-5.py
│   │   │   ├── polars-6.py
│   │   │   ├── polars-7.py
│   │   │   ├── polars-8.py
│   │   │   ├── polars-9.py
│   │   │   ├── query-params-0.py
│   │   │   └── query-params-1.py
│   │   └── snippets.py
│   ├── _sql
│   │   ├── connection_utils.py
│   │   ├── engines
│   │   │   ├── adbc.py
│   │   │   ├── clickhouse.py
│   │   │   ├── dbapi.py
│   │   │   ├── doc.md
│   │   │   ├── duckdb.py
│   │   │   ├── ibis.py
│   │   │   ├── pyiceberg.py
│   │   │   ├── redshift.py
│   │   │   ├── sqlalchemy.py
│   │   │   └── types.py
│   │   ├── error_utils.py
│   │   ├── get_engines.py
│   │   ├── parse.py
│   │   ├── sql.py
│   │   ├── sql_quoting.py
│   │   └── utils.py
│   ├── third_party_licenses.txt
│   ├── third_party.txt
│   ├── this.py
│   ├── _tracer.py
│   ├── _tutorials
│   │   ├── dataflow.py
│   │   ├── fileformat.py
│   │   ├── for_jupyter_users.py
│   │   ├── __init__.py
│   │   ├── intro.py
│   │   ├── layout.py
│   │   ├── markdown_format.md
│   │   ├── markdown.py
│   │   ├── plots.py
│   │   ├── README.md
│   │   ├── sql.py
│   │   └── ui.py
│   ├── _types
│   │   ├── ids.py
│   │   └── lifespan.py
│   ├── _utils
│   │   ├── assert_never.py
│   │   ├── async_path.py
│   │   ├── background_task.py
│   │   ├── case.py
│   │   ├── cell_matching.py
│   │   ├── code.py
│   │   ├── config
│   │   │   └── config.py
│   │   ├── dataclass_to_openapi.py
│   │   ├── data_uri.py
│   │   ├── debounce.py
│   │   ├── deep_merge.py
│   │   ├── deprecated.py
│   │   ├── dicts.py
│   │   ├── disposable.py
│   │   ├── distributor.py
│   │   ├── docs.py
│   │   ├── edit_distance.py
│   │   ├── env.py
│   │   ├── exiting.py
│   │   ├── files.py
│   │   ├── file_watcher.py
│   │   ├── flatten.py
│   │   ├── format_signature.py
│   │   ├── formatter.py
│   │   ├── fuzzy_match.py
│   │   ├── hashable.py
│   │   ├── health.py
│   │   ├── http.py
│   │   ├── __init__.py
│   │   ├── inline_script_metadata.py
│   │   ├── lifespans.py
│   │   ├── lists.py
│   │   ├── log_formatter.py
│   │   ├── marimo_path.py
│   │   ├── memoize.py
│   │   ├── methods.py
│   │   ├── msgspec_basestruct.py
│   │   ├── narwhals_utils.py
│   │   ├── net.py
│   │   ├── once.py
│   │   ├── parse_dataclass.py
│   │   ├── paths.py
│   │   ├── platform.py
│   │   ├── print.py
│   │   ├── repr.py
│   │   ├── requests.py
│   │   ├── rst_to_html.py
│   │   ├── scripts.py
│   │   ├── signals.py
│   │   ├── site_packages.py
│   │   ├── strings.py
│   │   ├── subprocess.py
│   │   ├── theme.py
│   │   ├── timer.py
│   │   ├── tmpdir.py
│   │   ├── toml.py
│   │   ├── typed_connection.py
│   │   ├── typing.py
│   │   ├── url.py
│   │   ├── uv.py
│   │   ├── uv_tree.py
│   │   ├── variable_name.py
│   │   ├── versions.py
│   │   ├── with_skip.py
│   │   ├── xdg.py
│   │   └── yaml.py
│   └── _version.py
├── mkdocs.yml
├── package.json
├── packages
│   ├── llm-info
│   │   ├── data
│   │   │   ├── models.yml
│   │   │   └── providers.yml
│   │   ├── icons
│   │   │   ├── anthropic.svg
│   │   │   ├── aws-dark.svg
│   │   │   ├── aws.svg
│   │   │   ├── azure.svg
│   │   │   ├── cloudflare.svg
│   │   │   ├── coreweave-dark.svg
│   │   │   ├── coreweave.svg
│   │   │   ├── deepseek.svg
│   │   │   ├── github.svg
│   │   │   ├── googlegemini.svg
│   │   │   ├── google.svg
│   │   │   ├── ollama.svg
│   │   │   ├── openai.svg
│   │   │   ├── opencode-logo-light.svg
│   │   │   ├── openrouter.svg
│   │   │   └── weightsandbiases.svg
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── src
│   │   │   ├── generate.ts
│   │   │   ├── index.ts
│   │   │   ├── simple_logger.ts
│   │   │   └── __tests__
│   │   │       ├── json-structure.test.ts
│   │   │       └── schema.test.ts
│   │   └── tsconfig.json
│   ├── lsp
│   │   ├── index.test.ts
│   │   ├── index.ts
│   │   ├── move.js
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── tsup.config.ts
│   │   └── turbo.json
│   ├── openapi
│   │   ├── api.yaml
│   │   ├── convert_types.js
│   │   ├── package.json
│   │   ├── src
│   │   │   ├── api.ts
│   │   │   ├── index.ts
│   │   │   ├── notebook.ts
│   │   │   └── session.ts
│   │   └── tsconfig.json
│   ├── pytest_changed
│   │   ├── __init__.py
│   │   └── README.md
│   ├── smart-cells
│   │   ├── package.json
│   │   ├── README.md
│   │   ├── src
│   │   │   ├── index.ts
│   │   │   ├── parsers
│   │   │   │   ├── index.ts
│   │   │   │   ├── markdown-parser.ts
│   │   │   │   ├── python-parser.ts
│   │   │   │   └── sql-parser.ts
│   │   │   ├── __tests__
│   │   │   │   ├── index.test.ts
│   │   │   │   ├── markdown-parser.test.ts
│   │   │   │   ├── python-ast.test.ts
│   │   │   │   ├── python-parser.test.ts
│   │   │   │   └── sql-parser.test.ts
│   │   │   ├── types.ts
│   │   │   └── utils
│   │   │       ├── dedent.ts
│   │   │       ├── index.ts
│   │   │       ├── python-ast.ts
│   │   │       ├── quote-parser.ts
│   │   │       └── string-escaper.ts
│   │   └── tsconfig.json
│   └── ts-config
│       ├── base.json
│       ├── library.json
│       ├── package.json
│       ├── README.md
│       └── ts-reset.d.ts
├── patches
│   ├── codemirror-extension-inline-suggestion.patch
│   └── html-to-image@1.11.13.patch
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
├── pyodide
│   └── build_and_serve.py
├── pyproject.toml
├── README_Chinese.md
├── README_Japanese.md
├── README.md
├── README_Spanish.md
├── README_Traditional_Chinese.md
├── scripts
│   ├── analyze_traces.py
│   ├── buildfrontend.sh
│   ├── buildlsp.sh
│   ├── buildwheel.sh
│   ├── convert_gif_to_webm.py
│   ├── generate_bash_focus.py
│   ├── generate_ipynb_fixtures.py
│   ├── generate_license.sh
│   ├── generate_lint_docs.py
│   ├── generate.py
│   ├── generate_release_notes.py
│   ├── generate_schemas.py
│   ├── modify_pyproject_for_marimo_base.py
│   ├── print_banned_cell_names.py
│   ├── pycheck.sh
│   ├── pycopyright.sh
│   ├── pytest.sh
│   ├── README.md
│   ├── release.sh
│   ├── test-lsp.sh
│   └── validate_base_wheel_size.sh
├── SECURITY.md
├── tests
│   ├── _ai
│   │   ├── llm
│   │   │   └── test_impl.py
│   │   ├── test_ai_types.py
│   │   ├── test_chat_convert.py
│   │   ├── test_chat_model.py
│   │   ├── test_pydantic_utils.py
│   │   ├── test_streaming_config.py
│   │   └── tools
│   │       ├── test_base.py
│   │       ├── test_utils.py
│   │       ├── tools
│   │       │   ├── test_cells.py
│   │       │   ├── test_datasource_tool.py
│   │       │   ├── test_dependency_graph.py
│   │       │   ├── test_errors_tool.py
│   │       │   ├── test_lint_tool.py
│   │       │   ├── test_notebooks.py
│   │       │   ├── test_rules.py
│   │       │   └── test_tables_variables.py
│   │       └── utils
│   │           └── test_output_cleaning.py
│   ├── _ast
│   │   ├── app_data
│   │   │   ├── calculator.py
│   │   │   ├── notebook_filename.py
│   │   │   └── ui_element_dropdown.py
│   │   ├── cell_data
│   │   │   └── named_cells.py
│   │   ├── codegen_data
│   │   │   ├── test_app_with_annotation_typing.py
│   │   │   ├── test_app_with_no_cells.py
│   │   │   ├── test_app_with_only_comments.py
│   │   │   ├── test_decorators.py
│   │   │   ├── test_empty.py
│   │   │   ├── test_function_decorator_call.py
│   │   │   ├── test_generate_filecontents_async_long_signature.py
│   │   │   ├── test_generate_filecontents_async.py
│   │   │   ├── test_generate_filecontents_empty.py
│   │   │   ├── test_generate_filecontents_empty_with_config.py
│   │   │   ├── test_generate_filecontents.py
│   │   │   ├── test_generate_filecontents_shadowed_builtin.py
│   │   │   ├── test_generate_filecontents_single_cell.py
│   │   │   ├── test_generate_filecontents_toplevel.py
│   │   │   ├── test_generate_filecontents_toplevel_pytest.py -> ../test_pytest_toplevel.py
│   │   │   ├── test_generate_filecontents_unshadowed_builtin.py
│   │   │   ├── test_generate_filecontents_with_syntax_error.py
│   │   │   ├── test_get_alias_import.py
│   │   │   ├── test_get_app_kwargs.py
│   │   │   ├── test_get_bad_kwargs.py
│   │   │   ├── test_get_codes_comment_after_sig.py
│   │   │   ├── test_get_codes_empty.py
│   │   │   ├── test_get_codes_messy.py
│   │   │   ├── test_get_codes_messy_toplevel.py
│   │   │   ├── test_get_codes_multiline_fndef.py
│   │   │   ├── test_get_codes_multiline_string.py
│   │   │   ├── test_get_codes_non_marimo_python_script.py
│   │   │   ├── test_get_codes_single_line_fn.py
│   │   │   ├── test_get_codes_with_incorrect_args_rets.py
│   │   │   ├── test_get_codes_with_name_error.py
│   │   │   ├── test_get_header_comments_invalid.py
│   │   │   ├── test_get_header_comments.py
│   │   │   ├── test_get_setup_blank.py
│   │   │   ├── test_get_setup.py
│   │   │   ├── test_invalid.py
│   │   │   ├── test_long_line_in_main.py
│   │   │   ├── test_main.py
│   │   │   ├── test_non_marimo.py
│   │   │   ├── _test_not_parsable.py
│   │   │   ├── _test_parse_error_in_notebook.py
│   │   │   ├── test_stacked_decorators_toplevel.py
│   │   │   ├── test_syntax_errors.py
│   │   │   ├── test_unparsable_cell_with_triple_quotes.py
│   │   │   └── test_with_decorator.py
│   │   ├── conftest.py
│   │   ├── test_app_cell.py
│   │   ├── test_app_config.py
│   │   ├── test_app.py
│   │   ├── test_cell_manager.py
│   │   ├── test_cell.py
│   │   ├── test_codegen.py
│   │   ├── test_compiler.py
│   │   ├── test_fast_stack.py
│   │   ├── test_load.py
│   │   ├── test_parse.py
│   │   ├── test_pytest.py
│   │   ├── test_pytest_scoped.py
│   │   ├── test_pytest_toplevel.py
│   │   ├── test_sql_utils.py
│   │   ├── test_sql_visitor.py
│   │   ├── test_toplevel.py
│   │   ├── test_transformers.py
│   │   └── test_visitor.py
│   ├── _cli
│   │   ├── cli_data
│   │   │   └── sandbox.py
│   │   ├── fixtures
│   │   │   ├── arithmetic.ipynb.txt
│   │   │   ├── blank.ipynb.txt
│   │   │   ├── juv.ipynb.txt
│   │   │   ├── markdown.ipynb.txt
│   │   │   ├── multiple_defs.ipynb.txt
│   │   │   └── unparsable.ipynb.txt
│   │   ├── snapshots
│   │   │   ├── converted_arithmetic.py.txt
│   │   │   ├── converted_blank.py.txt
│   │   │   ├── converted_juv.py.txt
│   │   │   ├── converted_markdown.py.txt
│   │   │   ├── converted_multiple_defs.py.txt
│   │   │   ├── converted_unparsable.py.txt
│   │   │   ├── export
│   │   │   │   ├── ipynb
│   │   │   │   │   ├── ipynb_topdown.txt
│   │   │   │   │   ├── ipynb.txt
│   │   │   │   │   ├── ipynb_with_errors.txt
│   │   │   │   │   ├── ipynb_with_media_outputs.txt
│   │   │   │   │   └── ipynb_with_outputs.txt
│   │   │   │   ├── md
│   │   │   │   │   ├── async.txt
│   │   │   │   │   ├── broken.txt
│   │   │   │   │   ├── export_markdown_with_errors.txt
│   │   │   │   │   └── markdown.txt
│   │   │   │   └── script
│   │   │   │       ├── script.txt
│   │   │   │       └── script_with_errors.txt
│   │   │   ├── ipynb_to_marimo.txt
│   │   │   ├── ipynb_to_marimo_with_output.txt
│   │   │   ├── markdown_to_marimo.txt
│   │   │   ├── python_script_no_main_to_marimo.txt
│   │   │   ├── python_script_to_marimo.txt
│   │   │   ├── remote_ipynb_to_marimo.txt
│   │   │   └── remote_markdown_to_marimo.txt
│   │   ├── test_cli_check.py
│   │   ├── test_cli_config.py
│   │   ├── test_cli_convert.py
│   │   ├── test_cli_development.py
│   │   ├── test_cli_errors.py
│   │   ├── test_cli_export.py
│   │   ├── test_cli_export_thumbnail.py
│   │   ├── test_cli.py
│   │   ├── test_cli_validators.py
│   │   ├── test_cloudflare.py
│   │   ├── test_endpoint.py
│   │   ├── test_envinfo.py
│   │   ├── test_file_overwrite.py
│   │   ├── test_file_path.py
│   │   ├── test_install_hints.py
│   │   ├── test_parse_args.py
│   │   ├── test_sandbox.py
│   │   ├── test_suggestions.py
│   │   ├── test_tutorial.py
│   │   └── test_upgrade.py
│   ├── _config
│   │   ├── test_config_packages.py
│   │   ├── test_config.py
│   │   ├── test_config_utils.py
│   │   ├── test_manager.py
│   │   ├── test_reader.py
│   │   └── test_secrets_config.py
│   ├── conftest.py
│   ├── _convert
│   │   ├── common
│   │   │   ├── __init__.py
│   │   │   ├── test_convert_format.py
│   │   │   └── test_dom_traversal.py
│   │   ├── ipynb
│   │   │   ├── fixtures
│   │   │   │   ├── ipynb
│   │   │   │   │   ├── cell_metadata.ipynb
│   │   │   │   │   ├── comments_preservation.ipynb
│   │   │   │   │   ├── duplicate_definitions_and_aug_assign.ipynb
│   │   │   │   │   ├── duplicate_definitions_read_before_write.ipynb
│   │   │   │   │   ├── duplicate_definitions_syntax_error.ipynb
│   │   │   │   │   ├── hides_markdown_cells.ipynb
│   │   │   │   │   ├── multiple_definitions.ipynb
│   │   │   │   │   ├── multiple_definitions_multiline.ipynb
│   │   │   │   │   └── pip_commands.ipynb
│   │   │   │   └── py
│   │   │   │       ├── complex_file_format.py
│   │   │   │       ├── complex_outputs.py
│   │   │   │       └── simple.py
│   │   │   ├── snapshots
│   │   │   │   ├── complex_file_format_top_down.ipynb.txt
│   │   │   │   ├── complex_outputs_top_down.ipynb.txt
│   │   │   │   ├── converted_cell_metadata.py.txt
│   │   │   │   ├── converted_comments_preservation.py.txt
│   │   │   │   ├── converted_duplicate_definitions_and_aug_assign.py.txt
│   │   │   │   ├── converted_duplicate_definitions_read_before_write.py.txt
│   │   │   │   ├── converted_duplicate_definitions_syntax_error.py.txt
│   │   │   │   ├── converted_hides_markdown_cells.py.txt
│   │   │   │   ├── converted_multiple_definitions_multiline.py.txt
│   │   │   │   ├── converted_multiple_definitions.py.txt
│   │   │   │   ├── converted_pip_commands.py.txt
│   │   │   │   ├── notebook_top_down.ipynb.txt
│   │   │   │   ├── notebook_topological.ipynb.txt
│   │   │   │   └── simple_top_down.ipynb.txt
│   │   │   ├── test_from_ir.py
│   │   │   ├── test_ipynb_to_ir.py
│   │   │   └── test_ipynb_to_marimo.py
│   │   ├── markdown
│   │   │   ├── snapshots
│   │   │   │   ├── dataflow.md.txt
│   │   │   │   ├── frontmatter-only.py.txt
│   │   │   │   ├── frontmatter-test.py.txt
│   │   │   │   ├── has-header.md.txt
│   │   │   │   ├── marimo_for_jupyter_users.md.txt
│   │   │   │   ├── no-frontmatter.py.txt
│   │   │   │   ├── sql.md.txt
│   │   │   │   ├── sql-notebook.py.txt
│   │   │   │   ├── unsafe-app.md.txt
│   │   │   │   ├── unsafe-app.py.txt
│   │   │   │   ├── unsafe-doc.md.txt
│   │   │   │   └── unsafe-doc.py.txt
│   │   │   ├── test_markdown_conversion.py
│   │   │   └── test_markdown_from_ir.py
│   │   ├── snapshots
│   │   │   ├── basic_marimo_example.py.txt
│   │   │   ├── basic_marimo_example_roundtrip.py.txt
│   │   │   ├── basic_marimo_example_to_md.txt
│   │   │   ├── minimal_script.py.txt
│   │   │   ├── pypercent_format.py.txt
│   │   │   ├── pypercent_markdown_only.py.txt
│   │   │   ├── pypercent_with_main.py.txt
│   │   │   ├── simple_script.py.txt
│   │   │   └── unparsable_cell_with_escaped_quotes.py.txt
│   │   ├── test_convert_non_marimo_python_script.py
│   │   └── test_convert_py.py
│   ├── _data
│   │   ├── _external_storage
│   │   │   ├── test_get_storage.py
│   │   │   └── test_storage_models.py
│   │   ├── mocks.py
│   │   ├── snapshots
│   │   │   ├── charts_bad_characters.txt
│   │   │   ├── charts-complex.txt
│   │   │   ├── charts_json_bad_data.txt
│   │   │   ├── charts_json.txt
│   │   │   ├── charts.txt
│   │   │   ├── column_preview_bool_chart_code.txt
│   │   │   ├── column_preview_bool_chart_spec.txt
│   │   │   ├── column_preview_bool_chart_spec_with_vegafusion.txt
│   │   │   ├── column_preview_categorical_chart_code.txt
│   │   │   ├── column_preview_categorical_chart_spec.txt
│   │   │   ├── column_preview_categorical_chart_spec_with_vegafusion.txt
│   │   │   ├── column_preview_date_chart_code.txt
│   │   │   ├── column_preview_duckdb_bool_chart_spec.txt
│   │   │   ├── column_preview_duckdb_categorical_chart_spec.txt
│   │   │   ├── column_preview_float_chart_code.txt
│   │   │   ├── column_preview_float_chart_spec.txt
│   │   │   ├── column_preview_float_chart_spec_with_vegafusion.txt
│   │   │   ├── column_preview_int_chart_code.txt
│   │   │   ├── column_preview_int_chart_spec.txt
│   │   │   ├── column_preview_int_chart_spec_with_vegafusion.txt
│   │   │   ├── column_preview_str_chart_code.txt
│   │   │   ├── column_preview_str_chart_spec.txt
│   │   │   └── column_preview_str_chart_spec_with_vegafusion.txt
│   │   ├── test_charts.py
│   │   ├── test_get_datasets.py
│   │   ├── test_models.py
│   │   ├── test_preview_column.py
│   │   ├── test_series.py
│   │   └── test_sql_summaries.py
│   ├── _dependencies
│   │   └── test_dependencies.py
│   ├── fixtures
│   │   ├── notebook_async.py
│   │   ├── notebook.md
│   │   ├── notebook.py
│   │   ├── notebook_sandboxed.py
│   │   ├── notebook_unparsable.py
│   │   ├── notebook_with_errors.py
│   │   ├── notebook_with_md.py
│   │   ├── notebook_with_media.py
│   │   └── notebook_with_multiple_definitions.py
│   ├── __init__.py
│   ├── _internal
│   │   ├── snapshots
│   │   │   └── internal_api.txt
│   │   └── test_internal_api.py
│   ├── _ipc
│   │   └── test_kernel_communication.py
│   ├── _islands
│   │   ├── snapshots
│   │   │   ├── header.txt
│   │   │   ├── html.txt
│   │   │   ├── island-mimetypes.txt
│   │   │   ├── island-no-code.txt
│   │   │   ├── island-no-output.txt
│   │   │   ├── island.txt
│   │   │   └── markdown.txt
│   │   └── test_island_generator.py
│   ├── _lint
│   │   ├── snapshots
│   │   │   ├── branch_expression_errors.txt
│   │   │   ├── cycle_dependencies_errors.txt
│   │   │   ├── empty_cells.txt
│   │   │   ├── formatting.txt
│   │   │   ├── markdown_dedent_errors.txt
│   │   │   ├── mixed_issues_errors.txt
│   │   │   ├── multiple_definitions_errors.txt
│   │   │   ├── self_import_pandas_errors.txt
│   │   │   ├── self_import_requests_errors.txt
│   │   │   ├── setup_dependencies_errors.txt
│   │   │   ├── sql_parsing_errors.txt
│   │   │   ├── star_import_errors.txt
│   │   │   ├── syntax_errors.txt
│   │   │   ├── transitive_site_import_errors.txt
│   │   │   └── unparsable_cell_errors.txt
│   │   ├── test_async_context_system.py
│   │   ├── test_empty_cells.py
│   │   ├── test_files
│   │   │   ├── branch_expression.py
│   │   │   ├── cycle_dependencies.py
│   │   │   ├── empty_cells.py
│   │   │   ├── formatting.py
│   │   │   ├── markdown_dedent.py
│   │   │   ├── mixed_issues.py
│   │   │   ├── module_shadow.py
│   │   │   ├── multiple_definitions.py
│   │   │   ├── self_import_conflict.py
│   │   │   ├── setup_dependencies.py
│   │   │   ├── sql_parsing_errors.py
│   │   │   ├── star_import.py
│   │   │   ├── syntax_errors.py
│   │   │   ├── test_transitive_site_import.py
│   │   │   └── unparsable_cell.py
│   │   ├── test_generated_with_comparison.py
│   │   ├── test_ignore_scripts.py
│   │   ├── test_json_formatter.py
│   │   ├── test_lint_system.py
│   │   ├── test_log_rules.py
│   │   ├── test_markdown_dedent.py
│   │   ├── test_run_check.py
│   │   ├── test_snapshot.py
│   │   ├── test_sql_log_rules_snapshot.py
│   │   ├── test_streaming_early_stopping.py
│   │   ├── test_validate_graph.py
│   │   └── utils.py
│   ├── _mcp
│   │   └── server
│   │       ├── prompts
│   │       │   ├── test_errors_prompts.py
│   │       │   └── test_notebooks_prompts.py
│   │       ├── test_exceptions.py
│   │       ├── test_mcp_server.py
│   │       └── test_responses.py
│   ├── _messaging
│   │   ├── mocks.py
│   │   ├── test_cell_output.py
│   │   ├── test_completion_option.py
│   │   ├── test_console_output_worker.py
│   │   ├── test_enc_hook.py
│   │   ├── test_messaging_context.py
│   │   ├── test_messaging_context_vars.py
│   │   ├── test_messaging_errors.py
│   │   ├── test_messaging_run_id_context.py
│   │   ├── test_mimetypes.py
│   │   ├── test_notifications.py
│   │   ├── test_print_override.py
│   │   ├── test_serde.py
│   │   ├── test_streams.py
│   │   ├── test_thread_local_proxy.py
│   │   ├── test_tracebacks.py
│   │   ├── test_types.py
│   │   └── test_variables.py
│   ├── _metadata
│   │   └── test_opengraph.py
│   ├── mocks.py
│   ├── _output
│   │   ├── formatters
│   │   │   ├── test_ai_formatters.py
│   │   │   ├── test_altair_formatters.py
│   │   │   ├── test_altair.py
│   │   │   ├── test_formatters.py
│   │   │   ├── test_formatter_utils.py
│   │   │   ├── test_ibis_formatters.py
│   │   │   ├── test_iframe.py
│   │   │   ├── test_ipython_formatters.py
│   │   │   ├── test_ipython_update.py
│   │   │   ├── test_matplotlib.py
│   │   │   ├── test_pandas.py
│   │   │   ├── test_plotly_formatters.py
│   │   │   ├── test_pytorch_formatters.py
│   │   │   ├── test_structures.py
│   │   │   └── test_sympy.py
│   │   ├── test_builder.py
│   │   ├── test_data.py
│   │   ├── test_formatter_registry.py
│   │   ├── test_hypertext.py
│   │   ├── test_md.py
│   │   ├── test_output_utils.py
│   │   ├── test_rich_help.py
│   │   ├── test_show_code.py
│   │   └── test_try_format.py
│   ├── _plugins
│   │   ├── core
│   │   │   ├── test_json_encoder.py
│   │   │   ├── test_media.py
│   │   │   └── test_web_component.py
│   │   ├── stateless
│   │   │   ├── status
│   │   │   │   └── test_progress.py
│   │   │   ├── test_audio.py
│   │   │   ├── test_flex.py
│   │   │   ├── test_icon.py
│   │   │   ├── test_image_compare.py
│   │   │   ├── test_image.py
│   │   │   ├── test_inspect.py
│   │   │   ├── test_lazy.py
│   │   │   ├── test_mpl.py
│   │   │   ├── test_plain_text.py
│   │   │   ├── test_routes.py
│   │   │   ├── test_sidebar.py
│   │   │   ├── test_stat.py
│   │   │   └── test_style.py
│   │   ├── test_download.py
│   │   ├── test_validators.py
│   │   └── ui
│   │       ├── _core
│   │       │   ├── test_registry.py
│   │       │   └── test_ui_element.py
│   │       └── _impl
│   │           ├── anywidget
│   │           │   └── test_anywidget_utils.py
│   │           ├── charts
│   │           │   └── test_altair_transformers.py
│   │           ├── chat
│   │           │   ├── test_chat_delta_streaming.py
│   │           │   └── test_chat.py
│   │           ├── dataframes
│   │           │   ├── test_dataframe.py
│   │           │   ├── test_handlers.py
│   │           │   ├── test_print_code.py
│   │           │   └── test_transforms.py
│   │           ├── snapshots
│   │           │   ├── parse_spec_duckdb.txt
│   │           │   ├── parse_spec_geopandas.txt
│   │           │   ├── parse_spec_narwhal.txt
│   │           │   ├── parse_spec_pandas.txt
│   │           │   ├── parse_spec_polars.txt
│   │           │   └── parse_spec_url.txt
│   │           ├── tables
│   │           │   ├── snapshots
│   │           │   │   ├── ibis.csv
│   │           │   │   ├── ibis.field_types.json
│   │           │   │   ├── ibis.json
│   │           │   │   ├── narwhals.field_types.json
│   │           │   │   ├── narwhals.json
│   │           │   │   ├── pandas.csv
│   │           │   │   ├── pandas.download.json
│   │           │   │   ├── pandas.field_types.json
│   │           │   │   ├── pandas.json
│   │           │   │   ├── polars.csv
│   │           │   │   ├── polars.download.json
│   │           │   │   ├── polars.field_types.json
│   │           │   │   └── polars.json
│   │           │   ├── test_default_table.py
│   │           │   ├── test_format.py
│   │           │   ├── test_ibis_table.py
│   │           │   ├── test_narwhals.py
│   │           │   ├── test_pandas_table.py
│   │           │   ├── test_polars_table.py
│   │           │   ├── test_selection.py
│   │           │   └── test_table_utils.py
│   │           ├── test_altair_chart.py
│   │           ├── test_anywidget.py
│   │           ├── test_array.py
│   │           ├── test_batch.py
│   │           ├── test_comm.py
│   │           ├── test_data_editor.py
│   │           ├── test_data_explorer.py
│   │           ├── test_dates.py
│   │           ├── test_dictionary.py
│   │           ├── test_file_browser.py
│   │           ├── test_input.py
│   │           ├── test_matrix.py
│   │           ├── test_nav_menu.py
│   │           ├── test_panel.py
│   │           ├── test_plotly.py
│   │           ├── test_run_button.py
│   │           ├── test_table.py
│   │           ├── test_tabs.py
│   │           ├── test_ui_mpl.py
│   │           └── utils
│   │               └── test_dataframe_utils.py
│   ├── _pyodide
│   │   ├── test_bootstrap.py
│   │   ├── test_pyodide_acceptance.mjs
│   │   ├── test_pyodide_session.py
│   │   ├── test_pyodide_streams.py
│   │   └── test_restartable_task.py
│   ├── _runtime
│   │   ├── layout
│   │   │   └── test_layout.py
│   │   ├── output
│   │   │   └── test_output.py
│   │   ├── packages
│   │   │   ├── test_import_error_extractors.py
│   │   │   ├── test_module_registry.py
│   │   │   ├── test_package_managers.py
│   │   │   ├── test_package_utils.py
│   │   │   └── test_pypi_package_manager.py
│   │   ├── reload
│   │   │   ├── conftest.py
│   │   │   ├── reload_data
│   │   │   │   ├── a.py
│   │   │   │   ├── b.py
│   │   │   │   ├── c.py
│   │   │   │   ├── d.py
│   │   │   │   └── __init__.py
│   │   │   ├── reload_test_utils.py
│   │   │   ├── test_autoreload.py
│   │   │   └── test_module_watcher.py
│   │   ├── runner
│   │   │   ├── test_cancelled_cells.py
│   │   │   ├── test_cell_runner.py
│   │   │   ├── test_hooks.py
│   │   │   └── test_kernel_runner.py
│   │   ├── runtime_data
│   │   │   └── cell_ui_element.py
│   │   ├── script_data
│   │   │   ├── contains_tests.py
│   │   │   ├── fn_exception.py
│   │   │   ├── func.py
│   │   │   ├── script_exception_function.py
│   │   │   ├── script_exception.py
│   │   │   ├── script_exception_setup_cell.py
│   │   │   ├── script_exception_with_imported_function.py
│   │   │   ├── script_exception_with_output.py
│   │   │   └── script_global_setup_difference.py
│   │   ├── snapshots
│   │   │   ├── docstrings_class.txt
│   │   │   ├── docstrings_function_external.txt
│   │   │   ├── docstrings_function_google.txt
│   │   │   ├── docstrings_function.txt
│   │   │   ├── docstrings_keyword.txt
│   │   │   └── docstrings_module.txt
│   │   ├── test_app_mode.py
│   │   ├── test_capture.py
│   │   ├── test_cell_output_list.py
│   │   ├── test_commands.py
│   │   ├── test_complete.py
│   │   ├── test_context.py
│   │   ├── test_control_flow.py
│   │   ├── test_copy.py
│   │   ├── test_dataflow_cases.py
│   │   ├── test_dataflow.py
│   │   ├── test_dotenv.py
│   │   ├── test_edges.py
│   │   ├── test_functions.py
│   │   ├── test_interrupt_handlers.py
│   │   ├── test_manage_script_metadata.py
│   │   ├── test_marimo_pdb.py
│   │   ├── test_patches.py
│   │   ├── test_primitives.py
│   │   ├── test_pytest_runtime.py
│   │   ├── test_query_params.py
│   │   ├── test_requests.py
│   │   ├── test_runtime_datasets.py
│   │   ├── test_runtime_external_storage.py
│   │   ├── test_runtime.py
│   │   ├── test_runtime_secrets.py
│   │   ├── test_single_execution.py
│   │   ├── test_state.py
│   │   ├── test_storage.py
│   │   ├── test_threads.py
│   │   ├── test_topology.py
│   │   ├── test_trace.py
│   │   ├── test_virtual_file.py
│   │   ├── utils
│   │   │   └── test_set_ui_element_request_manager.py
│   │   └── watch
│   │       └── test_watch.py
│   ├── _save
│   │   ├── cache-dumps
│   │   │   ├── json-dump-v1
│   │   │   │   └── E_77bl8j6jcyv_Lupfe4-wtT2LqVfhlYmtdEIjF3dY3pY.json
│   │   │   ├── json-dump-v2
│   │   │   │   └── E_JM3zJ46ZRk9AC7fTCdAB9LsFUCZMcfLp-cDvUsidAsE.json
│   │   │   ├── json-dump-v3
│   │   │   │   └── E_Gl8RU7GyKYjt8iMk0iIjsMAptXH0xoYfTgL2iidYW0I.json
│   │   │   ├── pickle-dump-v1
│   │   │   │   └── E_77bl8j6jcyv_Lupfe4-wtT2LqVfhlYmtdEIjF3dY3pY.pickle
│   │   │   ├── pickle-dump-v2
│   │   │   │   └── E_JM3zJ46ZRk9AC7fTCdAB9LsFUCZMcfLp-cDvUsidAsE.pickle
│   │   │   └── pickle-dump-v3
│   │   │       └── E_Gl8RU7GyKYjt8iMk0iIjsMAptXH0xoYfTgL2iidYW0I.pickle
│   │   ├── external_decorators
│   │   │   ├── app.py
│   │   │   ├── module_0
│   │   │   │   └── __init__.py
│   │   │   ├── module_1
│   │   │   │   └── __init__.py
│   │   │   ├── transitive_imports.py
│   │   │   ├── transitive_wrappers_1.py
│   │   │   └── transitive_wrappers_2.py
│   │   ├── loaders
│   │   │   ├── __init__.py
│   │   │   ├── mocks.py
│   │   │   └── test_loader.py
│   │   ├── store
│   │   │   ├── mocks.py
│   │   │   └── test_store.py
│   │   ├── stores
│   │   │   ├── test_file.py
│   │   │   ├── test_store_config.py
│   │   │   └── test_tiered.py
│   │   ├── stubs
│   │   │   ├── __init__.py
│   │   │   ├── test_pydantic_stub.py
│   │   │   └── test_stubs.py
│   │   ├── test_cache.py
│   │   ├── test_cache_versions.py
│   │   ├── test_external_decorators.py
│   │   └── test_hash.py
│   ├── _schemas
│   │   └── test_schema.py
│   ├── _secrets
│   │   ├── test_load_dotenv.py
│   │   └── test_secrets.py
│   ├── _server
│   │   ├── ai
│   │   │   ├── snapshots
│   │   │   │   ├── chat_system_prompts.txt
│   │   │   │   ├── edit_inline_prompts.txt
│   │   │   │   └── system_prompts.txt
│   │   │   ├── test_ai_config.py
│   │   │   ├── test_ai_ids.py
│   │   │   ├── test_mcp.py
│   │   │   ├── test_prompts.py
│   │   │   ├── test_providers.py
│   │   │   └── tools
│   │   │       └── test_tool_manager.py
│   │   ├── api
│   │   │   ├── endpoints
│   │   │   │   ├── test_ai.py
│   │   │   │   ├── test_assets.py
│   │   │   │   ├── test_auto_instantiate.py
│   │   │   │   ├── test_cache_endpoints.py
│   │   │   │   ├── test_config_endpoints.py
│   │   │   │   ├── test_datasources.py
│   │   │   │   ├── test_documentation.py
│   │   │   │   ├── test_editing.py
│   │   │   │   ├── test_execution.py
│   │   │   │   ├── test_export.py
│   │   │   │   ├── test_file_explorer.py
│   │   │   │   ├── test_files.py
│   │   │   │   ├── test_health.py
│   │   │   │   ├── test_home.py
│   │   │   │   ├── test_kiosk.py
│   │   │   │   ├── test_login.py
│   │   │   │   ├── test_lsp_endpoints.py
│   │   │   │   ├── test_mpl_endpoints.py
│   │   │   │   ├── test_packages.py
│   │   │   │   ├── test_resume_session.py
│   │   │   │   ├── test_secrets_endpoints.py
│   │   │   │   ├── test_sql_endpoints.py
│   │   │   │   ├── test_storage_endpoints.py
│   │   │   │   ├── test_terminal.py
│   │   │   │   ├── test_ws.py
│   │   │   │   ├── test_ws_rtc.py
│   │   │   │   └── ws
│   │   │   │       └── test_ws_formatter.py
│   │   │   ├── test_auth.py
│   │   │   ├── test_interrupt.py
│   │   │   └── test_middleware.py
│   │   ├── conftest.py
│   │   ├── export
│   │   │   ├── fixtures
│   │   │   │   └── apps
│   │   │   │       ├── basic.py
│   │   │   │       ├── empty_notebook.py
│   │   │   │       ├── error_ancestor.py
│   │   │   │       ├── error_complex.py
│   │   │   │       ├── error_cycle.py
│   │   │   │       ├── error_redefinition.py
│   │   │   │       ├── error_undefined.py
│   │   │   │       ├── error_value_with_stdout.py
│   │   │   │       ├── with_console_output.py
│   │   │   │       ├── with_dependencies.py
│   │   │   │       ├── with_layout.py
│   │   │   │       ├── with_outputs.py
│   │   │   │       └── with_stop.py
│   │   │   ├── snapshots
│   │   │   │   ├── ipynb
│   │   │   │   │   ├── basic.ipynb.txt
│   │   │   │   │   ├── empty_notebook.ipynb.txt
│   │   │   │   │   ├── error_ancestor.ipynb.txt
│   │   │   │   │   ├── error_complex.ipynb.txt
│   │   │   │   │   ├── error_cycle.ipynb.txt
│   │   │   │   │   ├── error_redefinition.ipynb.txt
│   │   │   │   │   ├── error_undefined.ipynb.txt
│   │   │   │   │   ├── error_value_with_stdout.ipynb.txt
│   │   │   │   │   ├── with_console_output.ipynb.txt
│   │   │   │   │   ├── with_dependencies.ipynb.txt
│   │   │   │   │   ├── with_layout.ipynb.txt
│   │   │   │   │   ├── with_outputs.ipynb.txt
│   │   │   │   │   └── with_stop.ipynb.txt
│   │   │   │   ├── run_until_completion_with_console_output.txt
│   │   │   │   ├── run_until_completion_with_stack_trace.txt
│   │   │   │   └── run_until_completion_with_stop.txt
│   │   │   ├── test_exporter.py
│   │   │   └── test_export_ipynb.py
│   │   ├── files
│   │   │   └── test_os_file_system.py
│   │   ├── mocks.py
│   │   ├── rtc
│   │   │   └── test_rtc_doc.py
│   │   ├── templates
│   │   │   ├── data
│   │   │   │   └── index.html
│   │   │   ├── snapshots
│   │   │   │   ├── export1.txt
│   │   │   │   ├── export2.txt
│   │   │   │   ├── export3.txt
│   │   │   │   ├── export4.txt
│   │   │   │   ├── export5.txt
│   │   │   │   └── export6.txt
│   │   │   ├── test_templates_api.py
│   │   │   ├── test_templates.py
│   │   │   └── utils.py
│   │   ├── test_asgi.py
│   │   ├── test_directory_scanner.py
│   │   ├── test_errors.py
│   │   ├── test_file_manager_absolute_path.py
│   │   ├── test_file_manager_filename.py
│   │   ├── test_file_manager.py
│   │   ├── test_file_router.py
│   │   ├── test_lsp.py
│   │   ├── test_path_validator.py
│   │   ├── test_print.py
│   │   ├── test_recents.py
│   │   ├── test_server_utils.py
│   │   ├── test_session_manager.py
│   │   ├── test_sessions.py
│   │   ├── test_templates_filename.py
│   │   ├── test_token_manager.py
│   │   └── test_utils_filename.py
│   ├── _session
│   │   ├── conftest.py
│   │   ├── extensions
│   │   │   ├── __init__.py
│   │   │   └── test_extensions.py
│   │   ├── __init__.py
│   │   ├── managers
│   │   │   ├── __init__.py
│   │   │   └── test_ipc.py
│   │   ├── notebook
│   │   │   ├── __init__.py
│   │   │   ├── test_serializer.py
│   │   │   └── test_storage.py
│   │   ├── state
│   │   │   ├── __init__.py
│   │   │   ├── snapshots
│   │   │   │   ├── basic_session.json
│   │   │   │   ├── console_session.json
│   │   │   │   ├── error_session.json
│   │   │   │   ├── mime_bundle_session.json
│   │   │   │   ├── mixed_error_session.json
│   │   │   │   └── README.md
│   │   │   ├── test_serialize_session_missing_type.py
│   │   │   ├── test_serialize_session.py
│   │   │   ├── test_session_external_storage.py
│   │   │   └── test_session_view.py
│   │   ├── test_file_change_handler.py
│   │   ├── test_file_watcher_integration.py
│   │   ├── test_resume_strategies.py
│   │   └── test_venv.py
│   ├── _smoke_tests
│   │   ├── config.yml
│   │   ├── run_all.py
│   │   └── test_run_as_script.py
│   ├── snapshots
│   │   ├── api.txt
│   │   ├── dependencies.txt
│   │   ├── optional-dependencies-lsp.txt
│   │   ├── optional-dependencies-mcp.txt
│   │   ├── optional-dependencies-recommended.txt
│   │   ├── optional-dependencies-sandbox.txt
│   │   └── optional-dependencies-sql.txt
│   ├── _snippets
│   │   └── test_snippets.py
│   ├── _sql
│   │   ├── test_adbc.py
│   │   ├── test_clickhouse.py
│   │   ├── test_connection_utils.py
│   │   ├── test_dbapi.py
│   │   ├── test_duckdb.py
│   │   ├── test_engines.py
│   │   ├── test_engine_utils.py
│   │   ├── test_get_engines.py
│   │   ├── test_ibis.py
│   │   ├── test_pyiceberg.py
│   │   ├── test_redshift.py
│   │   ├── test_sqlalchemy.py
│   │   ├── test_sql_error_handling.py
│   │   ├── test_sql_parse.py
│   │   ├── test_sql.py
│   │   └── test_sql_quoting.py
│   ├── test_api.py
│   ├── test_entrypoints.py
│   ├── test_loggers.py
│   ├── test_project_dependencies.py
│   ├── _utils
│   │   ├── config
│   │   │   ├── __init__.py
│   │   │   └── test_config_reader.py
│   │   ├── snapshots
│   │   │   ├── complex_project_tree_from_raw.json
│   │   │   ├── complex_project_tree.json
│   │   │   ├── complex_project_tree.txt
│   │   │   ├── docstring_complex.md
│   │   │   ├── docstring_one_liner.md
│   │   │   ├── docstring_summary.md
│   │   │   ├── docstring_summary.txt
│   │   │   ├── empty_project_tree.json
│   │   │   ├── empty_script_tree.json
│   │   │   ├── empty_script_tree.txt
│   │   │   ├── script_tree_from_raw.json
│   │   │   ├── script_tree.json
│   │   │   ├── script_tree.txt
│   │   │   └── simple_project_tree.json
│   │   ├── test_async_path.py
│   │   ├── test_background_task.py
│   │   ├── test_case.py
│   │   ├── test_dataclass_to_openapi.py
│   │   ├── test_data_uri.py
│   │   ├── test_debounce.py
│   │   ├── test_decorator.py
│   │   ├── test_deep_merge.py
│   │   ├── test_disposable.py
│   │   ├── test_distributor.py
│   │   ├── test_docs.py
│   │   ├── test_edit_distance.py
│   │   ├── test_file_watcher.py
│   │   ├── test_flatten.py
│   │   ├── test_format_signature.py
│   │   ├── test_formatter.py
│   │   ├── test_fuzzy_match.py
│   │   ├── test_health_utils.py
│   │   ├── test_inline_script_metadata.py
│   │   ├── test_lifespans.py
│   │   ├── test_marimo_path.py
│   │   ├── test_memoize.py
│   │   ├── test_methods.py
│   │   ├── test_msgspec_basestruct.py
│   │   ├── test_narwhals_utils.py
│   │   ├── test_once.py
│   │   ├── test_parse_dataclass.py
│   │   ├── test_paths.py
│   │   ├── test_platform.py
│   │   ├── test_repr.py
│   │   ├── test_rst_to_html.py
│   │   ├── test_scripts.py
│   │   ├── test_site_packages.py
│   │   ├── test_strings.py
│   │   ├── test_subprocess.py
│   │   ├── test_utils_request.py
│   │   ├── test_uv_tree.py
│   │   ├── test_versions.py
│   │   └── test_xdg.py
│   └── utils.py
├── tsconfig.json
└── turbo.json

710 directories, 4119 files
root@iZ7xv051npomtfakwd4555Z:~/dylan/skynetCheapBuy/marimo# 