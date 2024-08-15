import Layout from "../../Components/Layout/Layout";
import CreateItem from "../../Components/CreateItem/CreateItem";
import { useEffect, useRef, useState } from "react";
import toggle from "../../Utils/toggle";
import ContainerList from "../../Components/ContainerList/ContainerList";
import ListItem from "../../Components/ListItem/ListItem";
import EditItem from "../../Components/EditItem/EditItem";
import { useLocation, useNavigate } from "react-router-dom";
import { useAnimateButtons } from "../useAnimateButtons";
import removeZeros from "../../Utils/removeZeros";

function ShowSavePage() {
  const stateItemsInicial = {
    ingredients: [
      /*  {
        nombre: "Azucar",
        unidad_medida: "Libra",
        unidad_compra: 500,
        valor_compra: 2000,
        valor_gramo: null,
        cantidad_usada: 1735,
        valor_total: null,
      }, */
    ],
    packages: [
      /*  {
        nombre: "Frasco de vidrio",
        unidad_medida: "Caja",
        unidad_compra: 25,
        valor_compra: 15000,
        valor_gramo: null,
        cantidad_usada: 1735,
        valor_total: null,
      }, */
    ],
    results: {
      ingredients_cost: 0,
      packages_cost: 0,
      total_inputs: 0,
      work_cost: 0,
      total: 0,
      units_produced: 0,
      cost_by_unit: 0,
      price_by_unit: 0,
      utility: 0,
      sale_price: 0,
    },
  };

  const [items, setItems] = useState(stateItemsInicial);
  const [title, setTitle] = useState("");
  const [itemToEdit, setItemToEdit] = useState(null);
  // const [itemSave, setItemSave] = useState("");
  const inputNProducts = useRef();
  const inputPrice = useRef();

  const location = useLocation();
  let {
    state: { item },
  } = location;
  if (!item) {
    console.log("item no esta definido");
  }
  const titleText = item.name || "Sin titulo";

  const navigate = useNavigate();

  const { animateSaveButton } = useAnimateButtons();

  function deleteIngredientLocalStorage(nombre) {
    const newItems = { ...items };
    newItems.ingredients = newItems.ingredients.filter(
      (item) => item.nombre !== nombre
    );

    newItems.results.cost_by_unit = 0;
    newItems.results.utility = 0;
    inputNProducts.current.value = 0;
    inputPrice.current.value = 0;

    setItems(newItems);
  }
  function deletePackageLocalStorage(nombre) {
    const newItems = { ...items };
    newItems.packages = newItems.packages.filter(
      (item) => item.nombre !== nombre
    );
    newItems.results.cost_by_unit = 0;
    newItems.results.utility = 0;
    inputNProducts.current.value = 0;
    inputPrice.current.value = 0;
    setItems(newItems);
  }

  const sumAllIngredients = () => {
    const total = items.ingredients.reduce(
      (acc, cur) => Number(acc) + Number(cur.valor_total),
      0
    );

    if (items.results.ingredients_cost != total) {
      const newItems = { ...items };
      newItems.results.ingredients_cost = total;
      setItems(newItems);
    }

    return total;
  };

  const sumAllPackages = () => {
    const total = items.packages.reduce(
      (acc, cur) => Number(acc) + Number(cur.valor_total),
      0
    );

    if (items.results.packages_cost != total) {
      const newItems = { ...items };
      newItems.results.packages_cost = total;
      setItems(newItems);
    }

    return total;
  };

  function sumInputs() {
    const total = items.results.ingredients_cost + items.results.packages_cost;

    if (items.results.total_inputs != total) {
      const newItems = { ...items };
      newItems.results.total_inputs = total;
      setItems(newItems);
    }
    return total;
  }

  function sumWorkCost() {
    if (items.results.total_inputs > 0) {
      const total = (items.results.total_inputs * 60) / 100;
      if (items.results.work_cost != total) {
        const newItems = { ...items };
        newItems.results.work_cost = total;
        setItems(newItems);
      }
      return total;
    }
  }

  function sumTotal() {
    if (items.results.total_inputs && items.results.work_cost) {
      const total = items.results.total_inputs + items.results.work_cost;
      if (items.results.total != total) {
        const newItems = { ...items };
        newItems.results.total = total;
        setItems(newItems);
      }
      return total;
    }
  }

  function calculateCost() {
    const value = inputNProducts.current.value;

    if (value == "" || value == 0) {
      if (items.results.cost_by_unit != value) {
        const newItems = { ...items };
        newItems.results.cost_by_unit = 0;
        setItems(newItems);
      }
    } else if (items.results.total && value) {
      const total = removeZeros(items.results.total / Number(value)); //
      if (items.results.cost_by_unit != total) {
        const newItems = { ...items };
        newItems.results.cost_by_unit = total;
        newItems.results.units_produced = Number(value);
        setItems(newItems);
      }
      return total;
    }
  }
  function calculateUtil(e) {
    if (e.target.value == "") {
      if (items.results.utility != e.target.value) {
        const newItems = { ...items };
        newItems.results.utility = e.target.value;
        return setItems(newItems);
      }
    } else if (items.results.cost_by_unit && e.target.value) {
      const total = parseInt(e.target.value) - items.results.cost_by_unit;
      if (items.results.utility != total) {
        const newItems = { ...items };
        newItems.results.utility = total;
        newItems.results.price_by_unit = parseInt(e.target.value);
        setItems(newItems);
      }
      return total;
    }
  }

  function calculateTotalUtil() {
    if (items.results.utility && items.results.units_produced) {
      const total = items.results.utility * items.results.units_produced;
      if (items.results.total_utility != total) {
        const newItems = { ...items };
        newItems.results.total_utility = total;
        setItems(newItems);
      }
      return total;
    }
  }

  async function save() {
    try {
      let list = await localStorage.getItem("listSave");
      if (!list) {
        localStorage.setItem("listSave", JSON.stringify([]));
        list = [];
      }

      const parsedList = JSON.parse(list);

      const itemIndex = parsedList.findIndex(
        (itemSave) => itemSave.id === item.id
      );

      if (itemIndex !== -1) {
        parsedList[itemIndex] = {
          ...parsedList[itemIndex],
          ...items,
        };

        localStorage.setItem("listSave", JSON.stringify(parsedList));
      } else {
        console.log("el item no existe");
      }

      const $successMsg = document.querySelector(".success-msg");
      $successMsg.classList.add("success-msg-animation");

      setTimeout(() => {
        $successMsg.classList.remove("success-msg-animation");
      }, 1000);
    } catch (err) {
      console.error("hubo un error en useLocalStorage ", err);
    }
  }

  useEffect(() => {
    let itemsLS = localStorage.getItem("listSave");

    if (!itemsLS) {
      console.log("Error: no se encuentra informacion en el LocalStorage");
    }
    const parseItems = JSON.parse(itemsLS);

    console.log(parseItems);

    const itemIndex = parseItems.findIndex((itemLS) => itemLS.id === item.id);

    console.log(parseItems[itemIndex]);
    setItems(parseItems[itemIndex]);
  }, []);

  useEffect(() => {
    calculateTotalUtil();
    calculateCost();
    localStorage.setItem("items", JSON.stringify(items));
  }, [items]);

  return (
    <>
      <Layout>
        <h2 className="text-2xl mt-2">{titleText}</h2>
        <hr className="my-4 border-gray-700" />
        <button
          onClick={() => {
            toggle(".create-ingredient", "active");
            setTitle("Ingrediente");
          }}
          className="add-button fixed bottom-4 right-1 border-blue px-4 py-2 rounded-full w-18 h-12 flex items-center"
        >
          <p>Ingrediente</p>
          <span className="ml-1 font-black text-2xl">+</span>
        </button>
        <button
          onClick={() => {
            toggle(".create-ingredient", "active");
            setTitle("Empaque");
          }}
          className="add-button fixed bottom-4 left-1 border-blue px-4 py-2 rounded-full w-18 h-12 flex items-center"
        >
          Empaque <span className="ml-1 font-black text-2xl">+</span>
        </button>
        <button
          onClick={(e) => {
            const $exitBtn = e.currentTarget;

            $exitBtn.classList.add("exit-bnt-animation");

            $exitBtn.addEventListener(
              "transitionend",
              () => {
                $exitBtn.classList.remove("exit-bnt-animation");
                console.log("transitionend");

                localStorage.setItem(
                  "items",
                  JSON.stringify(stateItemsInicial)
                );
                setItems(stateItemsInicial);

                navigate("/save-list");
              },
              { once: false }
            );
          }}
          className="bg-rose-600 fixed  px-3 py-1 left-0 rounded-r-lg border-none"
        >
          Volver
        </button>
        {
          <output className="success-msg bg-green-700 px-2 py-1 rounded-md rounded-br-none rounded-tr-none">
            Guardado con exito !
          </output>
        }
        <CreateItem
          title={title}
          setTitle={setTitle}
          items={items}
          setItems={setItems}
          inputNProducts={inputNProducts}
          inputPrice={inputPrice}
        />
        <EditItem
          itemToEdit={itemToEdit}
          title={title}
          setTitle={setTitle}
          items={items}
          setItems={setItems}
        />
        <ContainerList title="Ingredientes">
          {items.ingredients?.map((ingredient) => (
            <ListItem
              setItemToEdit={setItemToEdit}
              key={ingredient.id}
              item={ingredient}
              titleList={"Ingredientes"}
              deleteItemLocalStorage={deleteIngredientLocalStorage}
            />
          ))}
        </ContainerList>
        <ContainerList title="Empaques">
          {items.packages?.map((pack) => (
            <ListItem
              setItemToEdit={setItemToEdit}
              key={pack.id}
              item={pack}
              titleList={"Empaques"}
              deleteItemLocalStorage={deletePackageLocalStorage}
            />
          ))}
        </ContainerList>
        <ContainerList title="Resultados">
          <article className="border-blue p-4 rounded-lg item-container mb-4">
            <table className="w-full mb-2">
              <tbody>
                <tr>
                  <td>Coste de ingredientes: </td>
                  <td>$ {sumAllIngredients() | "0"}</td>
                </tr>
                <tr>
                  <td>Coste de empaques y demas:</td>
                  <td>$ {sumAllPackages() | "0"}</td>
                </tr>
                <tr>
                  <td>Total de insumos: </td>
                  <td>$ {sumInputs() | "0"}</td>
                </tr>
                <tr>
                  <td>60% de trabajo: </td>
                  <td>$ {sumWorkCost() | "0"}</td>
                </tr>
                <tr>
                  <td>Total: </td>
                  <td>$ {sumTotal() | "0"}</td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="num-products">
                      {" "}
                      ¿Cuantas unidades salieron?
                    </label>
                  </td>
                  <td>
                    <button
                      onClick={() => {
                        if (inputNProducts.current.value > 0) {
                          const newItems = { ...items };
                          newItems.results.units_produced =
                            parseInt(inputNProducts.current.value) - 1;
                          setItems(newItems);
                          calculateCost();
                        } else {
                          return;
                        }
                      }}
                      className="w-8 mr-1 rounded-lg font-bold"
                    >
                      -
                    </button>

                    <input
                      ref={inputNProducts}
                      id="num-products"
                      className="w-10 text-sm text-center  text-black"
                      placeholder="Num. productos"
                      onClick={(e) => {
                        const length = e.target.value.length;
                        e.target.setSelectionRange(length, length);
                      }}
                      onChange={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                        calculateCost();
                        console.log(e);
                        const newItems = { ...items };
                        newItems.results.units_produced = e.target.value;
                        setItems(newItems);
                      }}
                      value={items.results.units_produced}
                    />
                    <button
                      onClick={() => {
                        if (inputNProducts.current.value == 0) {
                          const newItems = { ...items };
                          newItems.results.units_produced =
                            newItems.results.units_produced + 1;
                          setItems(newItems);
                          calculateCost();
                        } else {
                          const newItems = { ...items };
                          newItems.results.units_produced =
                            parseInt(inputNProducts.current.value) + 1;
                          setItems(newItems);
                          calculateCost();
                        }
                      }}
                      className="w-8 ml-1 rounded-lg font-bold"
                    >
                      +
                    </button>
                  </td>
                </tr>
                <tr>
                  <td>Costo por unidad:</td>
                  <td>${items.results.cost_by_unit}</td>
                </tr>
                <tr>
                  <td>
                    <label htmlFor="price">¿Que precio pondras?</label>
                  </td>
                  <td>
                    <input
                      ref={inputPrice}
                      id="price"
                      className="w-full text-sm text-center text-black"
                      placeholder="Precio de venta"
                      onClick={(e) => {
                        const length = e.target.value.length;
                        e.target.setSelectionRange(length, length);
                      }}
                      onChange={(e) => {
                        e.target.value = e.target.value.replace(/[^0-9]/g, "");
                        calculateUtil(e);
                        console.log(e);
                        const newItems = { ...items };
                        newItems.results.sale_price = e.target.value;
                        setItems(newItems);
                      }}
                      value={items.results.sale_price}
                    />
                  </td>
                </tr>
                <tr>
                  <td>Utilidad por unidad:</td>
                  <td>$ {items.results.utility | 0}</td>
                </tr>
                <tr>
                  <td>Utilidad total:</td>
                  <td>$ {items.results.total_utility | 0}</td>
                </tr>
              </tbody>
            </table>
          </article>
          <button
            id="save-btn"
            onClick={() => {
              animateSaveButton();
              save();
            }}
            className="main-button add-button border-blue px-4 py-2 rounded-full"
          >
            Guardar Costeo
          </button>
        </ContainerList>
      </Layout>
    </>
  );
}

export { ShowSavePage };
