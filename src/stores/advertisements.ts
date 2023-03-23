import { defineStore } from "pinia";
import type { Advertisement } from "@/views/menu/advertisements/add-advertisement/data/types";
import type { Ref } from "vue";
import { ref, onMounted } from "vue";
import {
  collection,
  doc,
  getDocs,
  deleteDoc,
  addDoc,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { db, storage } from "@/firebase";
import {
  ref as refStorage,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// <-- Types -->
interface AdvertisementStorageData {
  file: File | undefined;
}

interface AdvertisementToModify {
  createdBy: string;
  date: string;
  longDescription: string;
  showInMenu: string;
  source: string;
  title: string;
  type: string;
  id: string;
}

export const useAdvertisements = defineStore("advertisements", () => {
  // <-- Lifecycle Hooks -->
  onMounted(() => {
    getAdvertisements();
  });

  // <-- Variables -->
  const advertisements: Ref<Advertisement[]> = ref([]);

  // <-- Actions -->
  const addAdvertisement = async (
    advertisement: Advertisement,
    data: AdvertisementStorageData
  ) => {
    return await addDoc(collection(db, "ads"), advertisement)
      .then(async (docRef) => {
        const documentId = docRef.id;
        const isSuccess = await addAdvertisementStorageData(data, documentId);
        return isSuccess;
      })
      .catch((error) => {
        console.error(error);
        return false;
      });
  };

  const addAdvertisementStorageData = async (
    data: AdvertisementStorageData,
    id: string
  ) => {
    const isSuccess = ref(false);
    const adFileRef = refStorage(storage, `ads/${id}/files/file`);
    try {
      if (data.file != undefined) {
        return await uploadBytes(adFileRef, data.file as Blob)
          .then(async () => {
            await getDownloadURL(adFileRef).then(async (url) => {
              await updateDoc(doc(db, "ads", `${id}`), {
                file: url,
              });
            });
            isSuccess.value = true;
            return isSuccess;
          })
          .catch((e) => {
            console.error(e);
            isSuccess.value = false;
            return isSuccess;
          });
      }
      return true;
    } catch (e) {
      console.error(e);
      isSuccess.value = false;
      return isSuccess;
    }
  };

  const handleFeaturedAdvertisement = async (id: string) => {
    const selectedAdvertisement = advertisements.value.filter(
      (ad) => ad.id === id
    )[0];
    if (selectedAdvertisement.isFeatured) {
      selectedAdvertisement.isFeatured = !selectedAdvertisement.isFeatured;
      await updateDoc(doc(db, "ads", id), {
        isFeatured: false,
      });
    } else {
      selectedAdvertisement.isFeatured = !selectedAdvertisement.isFeatured;
      await updateDoc(doc(db, "ads", id), {
        isFeatured: true,
      });
    }
  };

  const deleteAdvertisement = async (id: string, file: string) => {
    await deleteDoc(doc(db, "ads", id));
    await deleteAdvertisementStorage(id, file);
  };

  const deleteAdvertisementStorage = async (id: string, file: string) => {
    if (!file) {
      return;
    }
    const isSuccess = ref(false);
    const adStorageRef = refStorage(storage, `ads/${id}/files/file`);
    deleteObject(adStorageRef)
      .then(() => {
        isSuccess.value = true;
      })
      .catch((error) => {
        isSuccess.value = false;
        console.error(error);
      });
    return isSuccess.value;
  };

  const getAdvertisements = async () => {
    const q = query(collection(db, "ads"), orderBy("title"));
    try {
      const querySnapshot = await getDocs(q);
      const firebaseAdvertisements: Advertisement[] = [];
      querySnapshot.forEach((doc) => {
        const advertisement = {
          createdBy: doc.data().createdBy,
          date: doc.data().date,
          file: doc.data().file,
          id: doc.id,
          isFeatured: doc.data().isFeatured,
          likes: doc.data().likes,
          longDescription: doc.data().longDescription,
          source: doc.data().source,
          title: doc.data().title,
          type: doc.data().type,
          views: doc.data().views,
        };
        firebaseAdvertisements.push(advertisement);
      });
      advertisements.value = firebaseAdvertisements;
    } catch (e) {
      console.error(e);
    }
  };

  const updateAdvertisementDetails = async (
    id: string,
    modifiedAdvertisement: AdvertisementToModify
  ) => {
    const isSuccess = ref(false);
    return await updateDoc(doc(db, "ads", id), {
      createdBy: modifiedAdvertisement.createdBy,
      date: modifiedAdvertisement.date,
      longDescription: modifiedAdvertisement.longDescription,
      showInMenu: modifiedAdvertisement.showInMenu,
      source: modifiedAdvertisement.source,
      title: modifiedAdvertisement.title,
      type: modifiedAdvertisement.type,
      id: modifiedAdvertisement.id,
    })
      .then(() => {
        isSuccess.value = true;
        return isSuccess.value;
      })
      .catch((e) => {
        console.error(e);
        isSuccess.value = false;
        return isSuccess.value;
      });
  };

  const handleLogout = () => {
    return (advertisements.value = []);
  };

  return {
    addAdvertisement,
    advertisements,
    deleteAdvertisement,
    addAdvertisementStorageData,
    getAdvertisements,
    handleFeaturedAdvertisement,
    handleLogout,
    updateAdvertisementDetails,
  };
});
