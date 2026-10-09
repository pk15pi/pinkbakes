import { useState } from "react";
import { createProduct, deleteProduct, updateProduct } from "../services/authService";
import { normalizeProduct } from "../productUtils";

const EMPTY_CAKE_FORM = {
  name: "",
  price: "",
  discount: "",
  category: "Birthday Cakes",
  description: "",
  image: "",
  availability: "in_stock",
  status: "published",
  available_quantity: 50,
  low_stock_threshold: 5,
};

export default function useAdminProducts({ catalog, setCatalog, notify }) {
  const [cakeForm, setCakeForm] = useState(EMPTY_CAKE_FORM);
  const [editingCakeId, setEditingCakeId] = useState(null);
  const [adminMessage, setAdminMessage] = useState("");

  function resetCakeForm() {
    setCakeForm(EMPTY_CAKE_FORM);
    setEditingCakeId(null);
    setAdminMessage("");
  }

  function populateCakeForm(item) {
    setEditingCakeId(item.id);
    setCakeForm({
      name: item.name || "",
      price: String(item.price ?? ""),
      discount: String(item.discount ?? 0),
      category: item.category || "Birthday Cakes",
      description: item.description || item.short_description || "",
      image: item.image || "",
      availability: item.availability || "in_stock",
      available_quantity: item.available_quantity ?? item.stock_remaining ?? 50,
      low_stock_threshold: item.low_stock_threshold ?? 5,
      status: item.status || "published",
    });
    setAdminMessage("");
  }

  function submitCakeForm(event) {
    event.preventDefault();
    if (!cakeForm.name.trim() || !cakeForm.price || !cakeForm.description.trim()) {
      setAdminMessage("Please fill in the cake name, price, and description.");
      return;
    }

    const token = localStorage.getItem("pinkbakes_admin_token");
    const baseImage = cakeForm.image || catalog[0]?.image || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1000&q=85";
    const existingCake = editingCakeId != null ? catalog.find(item => item.id === editingCakeId) : null;
    const payload = {
      name: cakeForm.name.trim(),
      price: Number(cakeForm.price),
      discount: Number(cakeForm.discount || 0),
      category: cakeForm.category,
      description: cakeForm.description.trim(),
      short_description: cakeForm.description.trim(),
      main_image: baseImage,
      image: baseImage,
      gallery: [baseImage, baseImage],
      images: [baseImage, baseImage],
      badge: Number(cakeForm.discount || 0) > 0 ? `${Number(cakeForm.discount || 0)}% OFF` : "New",
      rating: Number(existingCake?.rating ?? 4.8),
      featured: false,
      delivery_time: "24-48 hours",
      availability: cakeForm.availability || "in_stock",
      status: cakeForm.status || "published",
      available_quantity: Number(cakeForm.available_quantity ?? 50),
      low_stock_threshold: Number(cakeForm.low_stock_threshold ?? 5),
      is_active: true,
    };
    const request = editingCakeId != null
      ? updateProduct(editingCakeId, payload, token)
      : createProduct(payload, token);

    request
      .then(product => {
        const nextCake = normalizeProduct(product);
        if (editingCakeId != null) {
          setCatalog(previous => previous.map(item => item.id === editingCakeId ? nextCake : item));
          setAdminMessage("Cake updated successfully.");
          notify(`${nextCake.name} updated`);
        } else {
          setCatalog(previous => [nextCake, ...previous]);
          setAdminMessage("Cake added successfully.");
          notify(`${nextCake.name} added to the catalog`);
        }
        resetCakeForm();
      })
      .catch(error => {
        setAdminMessage(error.message || (editingCakeId != null ? "Could not update cake." : "Could not add cake."));
      });
  }

  function removeCake(id) {
    const token = localStorage.getItem("pinkbakes_admin_token");
    deleteProduct(id, token)
      .then(() => {
        setCatalog(previous => previous.filter(product => product.id !== id));
        if (editingCakeId === id) resetCakeForm();
        setAdminMessage("Cake removed successfully.");
        notify("Cake removed from catalog");
      })
      .catch(error => setAdminMessage(error.message || "Could not remove cake."));
  }

  return {
    cakeForm,
    setCakeForm,
    editingCakeId,
    adminMessage,
    setAdminMessage,
    resetCakeForm,
    populateCakeForm,
    submitCakeForm,
    removeCake,
  };
}
