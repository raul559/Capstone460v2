# File: expertSystem/__init__.py
# Role: Package initializer. Re-exports helpers for simpler imports.

# Linked to:
# - Intended to expose utilities like infer_from_form(...) to external callers.
# - Example usage (from elsewhere):
#     from expertSystem import infer_from_form

from .interface import infer_from_form



# to import this just do
#from expertSystem import infer_from_form

#ex = infer_from_form(request.form)  # returns ExpertOutput
# apply ex.filter_* to filter candidates
# add ex.class_bonus per dx to similarities
# show ex.reasons to the user
